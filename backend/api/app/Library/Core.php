<?php
namespace App\Library;

use Illuminate\Http\Request;

class Core
{
    static public function getHeaders(Request $Request)
    {
        $Headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => $Request->session()
                                       ->get('token_type') . ' ' . $Request->session()
                                                                           ->get('access_token'),
            'x-client-ip'   => $Request->ip()
        ];

        if (!empty($Request->header('x-branch-id'))) {
            $Headers['x-branch-id'] = $Request->header('x-branch-id');
        } else if (!empty($Request->header('x-branch-id-list'))) {
            $Headers['x-branch-id-list'] = $Request->header('x-branch-id-list');
        }
        if ($Request->session()
                    ->has('x-device-token')) {
            $Headers['x-device-token'] = $Request->session()
                                                 ->get('x-device-token');
        }

        return $Headers;
    }

    static public function parseQueryString(Request $Request)
    {
        $query = $Request->query();
        if (strpos($query['action'], 'login_data') !== false) {
            $query['app_type'] = $Request->session()
                                         ->get('app_type');
        }

        return $query['action'] . '?' . http_build_query($query);
    }

    static public function getUrl(Request $Request)
    {
        $string = self::parseQueryString($Request);

        return self::getFinalUrl($Request, $string);
    }

    static public function getStaticUrl(Request $Request)
    {
        return self::getFinalUrl($Request, $Request->get('action'));
    }

    static public function getFinalUrl(Request $Request, $queryString)
    {
        $queryString = explode('?', $queryString);
        switch ($Request->get('action')) {
            case 'oauth/token':
                return env('API_URL') . '/' . $queryString[0];
            default:
                return env('API_URL') . env('API_PREFIX') . '/' . $queryString[0];
        }
    }
}
