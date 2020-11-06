<?php

namespace App\Http\Controllers;

use App\Exceptions\ErrorCodes;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Validation\Validator;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     *
     * @param Validator $validator
     * @param string    $errorMessage
     * @param int       $status
     *
     * @return mixed
     */
    protected function returnValidationErrors(Validator $validator, $errorMessage, $status = Response::HTTP_BAD_REQUEST, $errorCode = '')
    {
        $errors = ['status'            => $status,
                   'error_message'     => $errorMessage,
                   'error_code'        => $errorCode,
                   'validation_errors' => $validator->errors()];

        return response()->json($errors, $status, [], JSON_PRETTY_PRINT);
    }

    /**
     *
     * @param        $errors
     * @param        $errorMessage
     * @param int    $status
     * @param string $errorCode
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function returnCustomValidationErrors($errors, $errorMessage, $status = Response::HTTP_BAD_REQUEST, $errorCode = '')
    {
        $errors = ['status'            => $status,
                   'error_message'     => $errorMessage,
                   'error_code'        => $errorCode,
                   'validation_errors' => $errors];

        return response()->json($errors, $status, [], JSON_PRETTY_PRINT);
    }

    /**
     *
     * @param        $errorMessage
     * @param int    $status
     * @param string $errorCode
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function returnError($errorMessage, $status = Response::HTTP_BAD_REQUEST, $errorCode = '')
    {
        $errors = ['status'            => $status,
                   'error_message'     => $errorMessage,
                   'error_code'        => ErrorCodes::getErrorMessage($errorCode),
                   'validation_errors' => null];

        return response()->json($errors, $status, [], JSON_PRETTY_PRINT);
    }

    /**
     *
     * @param     $successMessage
     * @param int $status
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function returnSuccess($successMessage, $status = Response::HTTP_OK)
    {
        $errors = ['success_message' => $successMessage];

        return response()->json($errors, $status, [], JSON_PRETTY_PRINT);
    }
}
