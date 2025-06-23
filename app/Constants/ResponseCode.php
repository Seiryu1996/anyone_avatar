<?php

namespace App\Constants;

/**
 * Constants for HTTP Response Codes
 *
 * Defines common HTTP response codes used in the application.
 *
 * @category Description
 * @package  App\Constants
 * @author   Seiryu Uehata <seiryu.uehata@gmail.com>
 * @license  MIT https://opensource.org/license/mit/
 * @link     http://example.com
 */
class ResponseCode
{
    const SUCCESS = 200;
    const CREATED = 201;
    const ACCEPTED = 202;
    const NO_CONTENT = 204;

    const BAD_REQUEST = 400;
    const UNAUTHORIZED = 401;
    const FORBIDDEN = 403;
    const NOT_FOUND = 404;
    const CONFLICT = 409;

    const INTERNAL_SERVER_ERROR = 500;
    const SERVICE_UNAVAILABLE = 503;
}
