<?php
namespace App\Library;

class MCryptAES
{
    private $passkey;

    public function __construct($passKey)
    {
        $this->passkey = $passKey;
    }

    function encrypt($data, $salt = null)
    {
        $salt = $salt ?: openssl_random_pseudo_bytes(8);
        list($key, $iv) = $this->evpkdf($this->passkey, $salt);

        $ct = openssl_encrypt($data, 'aes-256-cbc', $key, true, $iv);

        return $this->encode($ct, $salt);
    }

    function decrypt($base64)
    {
        list($ct, $salt) = $this->decode($base64);
        if ($ct == "snderr") {
            return false;
        }
        list($key, $iv) = $this->evpkdf($this->passkey, $salt);

        $data = openssl_decrypt($ct, 'aes-256-cbc', $key, true, $iv);

        return $data;
    }

    function evpkdf($passphrase, $salt)
    {
        $salted = '';
        $dx     = '';
        while (strlen($salted) < 48) {
            $dx     = md5($dx . $passphrase . $salt, true);
            $salted .= $dx;
        }
        $key = substr($salted, 0, 32);
        $iv  = substr($salted, 32, 16);

        return [$key, $iv];
    }

    function decode($base64)
    {
        $data = base64_decode($base64);
        $ct   = "snderr";
        $salt = "snderr";

        if (substr($data, 0, 8) !== "Salted__") {
            return [$ct, $salt];
        }

        $salt = substr($data, 8, 8);
        $ct   = substr($data, 16);

        return [$ct, $salt];
    }

    function encode($ct, $salt)
    {
        return base64_encode("Salted__" . $salt . $ct);
    }
}
