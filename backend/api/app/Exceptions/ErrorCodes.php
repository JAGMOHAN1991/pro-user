<?php


namespace App\Exceptions;


class ErrorCodes
{
    const INVALID_INPUTS              = 1001;
    const NO_DATA_FOUND               = 1002;
    const PASSWORD_RESET_REQUIRED     = 1003;
    const VERIFY_OTP_FOR_DEVICE_TOKEN = 1004;

    const CHECKSUM_FAILED = 1005;
    const ACCESS_DENIED   = 1006;
    const UNAUTHENTICATED = 1007;

    const MOBILE_NUMBER_REQUIRED = 1010;
    const MOBILE_NOT_VERIFIED    = 1011;
    const ACCOUNT_INACTIVE       = 1012;
    const EMAIL_NOT_VERIFIED     = 1013;
    const PAYMENT_REQUIRED       = 1014;
    const ACCOUNT_LOGIN_ERROR    = 1015;

    const INVALID_CLIENT_IP   = 1020;
    const DEVICE_NOT_VERIFIED = 1021;
    const INVALID_OTP         = 1022;
    const INVALID_BRANCH_ID   = 1023;

    // TODO: Define label as well whenever you add a new error code!

    static private $errors = [self::INVALID_INPUTS              => 'INVALID_INPUTS',
                              self::PASSWORD_RESET_REQUIRED     => 'PASSWORD_RESET_REQUIRED',
                              self::NO_DATA_FOUND               => 'NO_DATA_FOUND',
                              self::VERIFY_OTP_FOR_DEVICE_TOKEN => 'VERIFY_OTP_FOR_DEVICE_TOKEN',
                              self::UNAUTHENTICATED             => 'UNAUTHORIZED',
                              self::ACCESS_DENIED               => 'ACCESS_DENIED',
                              self::CHECKSUM_FAILED             => 'CHECKSUM_FAILED',
                              self::MOBILE_NUMBER_REQUIRED      => 'MOBILE_NUMBER_REQUIRED',
                              self::MOBILE_NOT_VERIFIED         => 'MOBILE_NOT_VERIFIED',
                              self::EMAIL_NOT_VERIFIED          => 'EMAIL_NOT_VERIFIED',
                              self::PAYMENT_REQUIRED            => 'PAYMENT_REQUIRED',
                              self::ACCOUNT_INACTIVE            => 'ACCOUNT_INACTIVE',
                              self::ACCOUNT_LOGIN_ERROR         => 'PAYWORLD_LOGIN_ERROR',
                              self::INVALID_CLIENT_IP           => 'INVALID_CLIENT_IP',
                              self::DEVICE_NOT_VERIFIED         => 'DEVICE_NOT_VERIFIED',
                              self::INVALID_OTP                 => 'INVALID_OTP',
                              self::INVALID_BRANCH_ID           => 'INVALID_BRANCH_ID',
    ];


    static public function getErrorMessage($code)
    {
        return (isset(self::$errors[$code])) ? self::$errors[$code] : '';
    }
}
