<?php
namespace App\Library;

use Illuminate\Session\Store;

class Session
{

    const SgsTokenType    = 'token_type';
    const SgsExpiresIn    = 'expires_in';
    const SgsAccessToken  = 'access_token';
    const SgsRefreshToken = 'refresh_token';
    const Authorization   = 'Authorization';
    const UserCode        = 'party_code';

    /* @var \Illuminate\Support\Facades\Session */

    private $LaravelSession;

    public function __construct(Store $Session)
    {
        $this->LaravelSession = $Session;
    }

    public function set($key, $value)
    {
        if (empty($key)) {
            throw new \Exception('Invalid key');
        }

        $this->LaravelSession->put($key, $value);
        $this->LaravelSession->save();

        return $this;
    }

    public function get($key)
    {
        if (empty($key)) {
            throw new \Exception('Invalid key');
        }

        return $this->LaravelSession->get($key);
    }

    public function batchSetSession(array $data)
    {
        if (empty($data)) {
            throw new \Exception('Invalid data');
        }

        foreach($data as $key => $value) {
            $this->LaravelSession->put($key, $value);
        }

        return $this;
    }

    public function has($key)
    {
        if (empty($key)) {
            throw new \Exception('Invalid key');
        }

        return $this->LaravelSession->has($key);
    }

    public function deleteKey($key)
    {
        if (empty($key)) {
            throw new \Exception('Invalid key');
        }
        $this->LaravelSession->forget($key);

        return $this;
    }

    public function deleteKeys(array $keys)
    {
        if (!is_array($keys)) {
            throw new \Exception('Invalid array');
        }
        foreach($keys as $key => $value) {
            $this->LaravelSession->forget($key);
        }

        return $this;
    }

    public function flush()
    {
        $this->LaravelSession->flush();

        return $this;
    }

    public function invalidate()
    {
        $this->LaravelSession->invalidate();

        return $this;
    }

    public function flash($key, $value)
    {
        $this->LaravelSession->flash($key, $value);

        return $this;
    }

    public function reflash()
    {
        $this->LaravelSession->reflash();

        return $this;
    }
}
