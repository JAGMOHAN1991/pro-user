<?php
namespace App\Library;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Response;

class GuzzleRequest
{
    public static function requestCall($method, $url, array $body, array $headers, $hasFile = false)
    {
        try {
            $Client = new Client(['defaults' => ['verify' => true]]);
            switch (strtolower($method)) {
                case 'get':
                    $Response = $Client->request($method, $url, [
                        'headers' => $headers,
                    ]);

                    break;

                case 'post':
                    if ($hasFile) {
                        $headers['Content-Type'] = 'multipart/form-data';
                        $httpcode                = '';
                        $Response                = GuzzleRequest::requestApiCurl($url, $body, $headers, $method, $httpcode);
                    } else {
                        $Response = $Client->request($method, $url, ['headers' => $headers,
                                                                     'body'    => json_encode($body)]);
                    }
                    break;

                case 'put':
                    $Response = $Client->request($method, $url, ['headers' => $headers,
                                                                 'body'    => json_encode($body)]);
                    break;

                case 'delete':
                    $Response = $Client->request($method, $url, [
                        'headers' => $headers,
                    ]);

                    break;

                case 'postfile':
                    $Response = $Client->request('post', $url, ['headers'   => $headers,
                                                                'multipart' => $body]);
                    break;
            }
            $FinalResponse = self::parseGuzzleResponse($Response);
        } catch (RequestException $Exception) {
            $FinalResponse = self::parseGuzzleRequestException($Exception, $body, $url, true);
        } catch (\Exception $Exception) {
            $FinalResponse = self::parseGuzzleRequestException($Exception, $body, $url, false);
        } catch (GuzzleException $Exception) {
            $FinalResponse = self::parseGuzzleRequestException($Exception, $body, $url, false);
        }

        return $FinalResponse;
    }

    public static function requestApiCurl($url, $data = "", $headers = [], $method = 'post', &$httpcode)
    {
        $headerArr = [];
        foreach ($headers as $key => $value) {
            array_push($headerArr, $key . ": " . $value);
        }
        array_push($headerArr, 'User-Agent: ' . $_SERVER['HTTP_USER_AGENT']);
        $ch = curl_init();
        if (strtolower($method) == 'post') {
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        } else if (strtolower($method) == 'delete') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        } else if (strtolower($method) == 'put') {
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        } else {
            if ($data != "") {
                curl_setopt($ch, CURLOPT_URL, $url . "?" . $data);
            } else {
                curl_setopt($ch, CURLOPT_URL, $url);
            }
            curl_setopt($ch, CURLOPT_POST, false);
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, env('REQUEST_CONNECT_TIMEOUT'));
        curl_setopt($ch, CURLOPT_TIMEOUT, env('REQUEST_TIMEOUT'));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headerArr);
        curl_setopt($ch, CURLINFO_HEADER_OUT, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $respdata = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (curl_errno($ch) !== 0) {
            return false;
        }

        $Response = new Response($httpcode, $headers, $respdata);
        return $Response;
    }


    static public function parseGuzzleResponse(Response $Response)
    {
        $data = json_decode($Response->getBody()
                                     ->getContents(), true);

        if (empty($data)) {
            \Log::error('Unable to parse data' . $Response->getBody()
                                                          ->getContents());
        }

        if($Response->getStatusCode() == \Illuminate\Http\Response::HTTP_BAD_REQUEST){
            return $data;
        }

        return [
            'status'            => is_null($data) ? 400 : $Response->getStatusCode(),
            'error_code'        => '',
            'data'              => is_null($data) ? [] : $data,
            'error_message'     => '',
            'validation_errors' => []
        ];
    }

    static public function parseGuzzleRequestException($Exception, $body, $url, $isGuzzle)
    {
        $ErrorResponse = [];
        if ($isGuzzle) {
            // dd($Exception->getMessage());
            if (!$Exception->getResponse()) {
                $ErrorResponse['status']            = 400;
                $ErrorResponse['error_code']        = "";
                $ErrorResponse['error_message']     = $Exception->getMessage();
                $ErrorResponse['validation_errors'] = [];
            } else {
                $tmpErrorResponse                   = json_decode($Exception->getResponse()
                                                                            ->getBody()
                                                                            ->__toString(), true);
                $ErrorResponse['status']            = !empty($tmpErrorResponse['status']) ? $tmpErrorResponse['status'] : $Exception->getResponse()
                                                                                                                                    ->getStatusCode();
                $ErrorResponse['error_code']        = !empty($tmpErrorResponse['error_code']) ? $tmpErrorResponse['error_code'] : (!empty($tmpErrorResponse['error']) ? $tmpErrorResponse['error'] : '');
                $ErrorResponse['error_message']     = !empty($tmpErrorResponse['error_message']) ? $tmpErrorResponse['error_message'] : (!empty($tmpErrorResponse['message']) ? $tmpErrorResponse['message'] : '');
                $ErrorResponse['validation_errors'] = !empty($tmpErrorResponse['validation_errors']) ? $tmpErrorResponse['validation_errors'] : [];
            }
        } else {
            $ErrorResponse['status']        = 400;
            $ErrorResponse['error_code']    = "";
            $ErrorResponse['error_message'] = 'Some error occurred please try again 1001';
            if ($Exception->getMessage()) {
                $ErrorResponse['error_message'] = $Exception->getMessage();
            }
            $ErrorResponse['validation_errors'] = [];
        }

        return $ErrorResponse;
    }

    private function getParameters(array $queryList)
    {
        unset($queryList['method']);
        unset($queryList['action']);
        $response = '';
        foreach ($queryList as $key => $value) {
            if ($value != 'undefined') {
                $response .= $key . '=' . $value . '&';
            }
        }

        return $response;
    }
}
