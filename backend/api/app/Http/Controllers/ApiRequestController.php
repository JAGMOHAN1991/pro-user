<?php


namespace App\Http\Controllers;

use App\Library\Core;
use App\Library\GuzzleRequest;
use App\Library\MCryptAES;
use App\Library\Session;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ApiRequestController
{
    public function getRequest(Request $Request)
    {
        $Session = new Session($Request->getSession());
        try {
            $queryList = $Request->query();
            $headers   = [
                'Content-Type' => 'application/json'
            ];

            $headers = $this->setApiHeaders($Session, $headers, $queryList);
            if ($queryList['action'] === 'oauth/token') {
                $queryList = $this->getLoginRequestData($queryList);
            }

            if ($queryList['action'] !== 'oauth/token' && $queryList['action'] !== 'login_data') {
                if (!$Session->has(Session::Authorization)) {
                    return ['responseCode' => 401, 'responseMessage' => 'You are not authorized.'];
                }
            }

            $url = Core::getUrl($Request);
            \Log::error('request log', [$url,  $queryList['method'], $queryList, $headers]);
            $Response = GuzzleRequest::requestCall($queryList['method'], $url, $queryList, $headers);

            if ($Response['status'] === 200) {
                if ($queryList['action'] === 'oauth/token') {
                    \Log::error('Response', $Response);
                    $this->login($Session, $Response['data']);
                } else if ($queryList['action'] === 'login_data') {
                    $key = 'my-jwt-key';
                    $Response['data']['data'] = JWT::decode($Response['data']['data'], $key, ['HS256']);
                }
            }

            return response()->json($Response, $Response['status']);
        } catch (\Exception $Exception) {
            $url = Core::getUrl($Request);
            $Response = GuzzleRequest::parseGuzzleRequestException($Exception, [], $url, false);
            return response()->json($Response, $Response['status']);
        }
    }

    public function postRequest(Request $Request)
    {
        $Session = new Session($Request->getSession());
        try {
            $queryList = $Request->all();
            $headers   = [
                'Content-Type' => 'application/json'
            ];

            $headers = $this->setApiHeaders($Session, $headers, $queryList);

            if ($queryList['action'] === 'oauth/token') {
                $queryList = $this->getLoginRequestData($queryList);
            }

            if ($queryList['action'] !== 'oauth/token' && $queryList['action'] !== 'agent/login_data') {
                if (!$Session->has(Session::Authorization)) {
                    return ['responseCode' => 401, 'responseMessage' => 'You are not authorized.'];
                }
            }

            if ($queryList['action'] === 'get_token') {
                return $this->getToken($Session, $queryList);
            }

            $url = Core::getUrl($Request);

            $hasFile   = false;
            $queryList = $this->setFileDataIfExists($Request->allFiles(), $queryList, $hasFile);
            $Response  = GuzzleRequest::requestCall('post', $url, $queryList, $headers, $hasFile);
            if ($Response['status'] === 200) {
                if ($queryList['action'] === 'oauth/token') {
                    $this->login($Session, $Response['data']);
                }
            }

            return response()->json($Response, $Response['status']);
        } catch (\Exception $Exception) {
            $url = Core::getUrl($Request);

            $Response = GuzzleRequest::parseGuzzleRequestException($Exception, [], $url, false);

            return response()->json($Response, $Response['status']);
        }
    }

    public function getLoginRequestData(array $queryData)
    {
        return array_merge($queryData, [
            'client_id'     => env('CLIENT_ID'),
            'client_secret' => env('CLIENT_SECRET'),
            'grant_type'    => env('GRANT_TYPE'),
            'scope'         => env('SCOPE'),
        ]);
    }

    private function login(Session $Session, array $tokenData)
    {
        $Session->set(Session::Authorization, $tokenData[Session::SgsAccessToken]);
    }

    public function logout(Request $Request)
    {
        $Session = $Request->getSession();
        $status  = false;
        if (!empty($Session)) {
            $Session->flush();
            $status = true;
        }

        return response()->json(['status' => $status], !empty($status) ? 200 : 400);
    }

    private function setApiHeaders(Session $Session, array $headers, array $queryList)
    {
        $mainAction = explode('/', $queryList['action']);
        if ($mainAction[0] == 'reset_password') {
            $resethead = [
                'x-client-id' => env('CLIENT_ID')
            ];

            return array_merge($headers, $resethead);
        } else {
            if ($Session->has(Session::Authorization)) {
                return array_merge($headers, [Session::Authorization => 'Bearer '.$Session->get(Session::Authorization)]);
            }
        }

        return $headers;
    }

    private function getParameters(array $queryList)
    {
        unset($queryList['method']);
        unset($queryList['action']);
        $response = '';
        foreach ($queryList as $key => $value) {
            if ($value != 'undefined') {
                $response .= '&' . $key . '=' . $value;
            }
        }

        return $response;
    }

    private function setFileDataIfExists(array $fileData, array $queryList, &$hasFile)
    {

        foreach ($fileData as $key => $file) {
            if ($file instanceof UploadedFile) {
                $queryList['file'] = new \CURLFile($file->getPathname(), $file->getMimeType(), $file->getFilename());
            }elseif(is_array($file)){
                $counter = 0;
                foreach($file as $k=>$f){
                    if ($f instanceof UploadedFile) {
                        unset($queryList[$key]);
                        $queryList[$key.'['.$counter.']'] = new \CURLFile($f->getPathname(), $f->getMimeType(), $f->getFilename());
                        $counter++;
                    }
                }
            }
        }
        $hasFile = count($fileData) > 0;

        return $queryList;
    }

    public function getToken($Session, $queryList)
    {
        try {
            if (empty($queryList['token'])) {
                return [ false ];
            }

            $aesKey = md5($Session->get(Session::UserCode));
            $aesKey = substr($aesKey, 0, 16);
            $aesObj = new MCryptAES($aesKey);

            $accesstoken = $aesObj->encrypt($queryList['token']);

            return response()->json(['token' => $accesstoken, 'url' => env($queryList['type'])], 200);
        }catch(\Exception $Exception) {
            return response()->json(['token_not_found' => true], 400);
        }
    }
}
