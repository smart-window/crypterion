<?php
/**
 * ======================================================================================================
 * File Name: PendingApproval.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 10/23/2020 (12:19 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2020. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Adapters\Coin\Resources;


use Exception;

class PendingApproval
{
    use Parser;

    protected $validTypes = [
        'id'    => 'string',
        'state' => 'string',
        'scope' => 'string',
        'info'  => 'array',
        'data'  => 'array'
    ];

    /**
     * @var array
     */
    protected $resource;


    /**
     * PendingApproval constructor.
     *
     * @param $resource
     * @throws Exception
     */
    public function __construct(array $resource)
    {
        $this->resource = $this->parse($resource, ['data']);
    }

    /**
     * @return string
     * @throws Exception
     */
    public function getId()
    {
        return $this->get('id');
    }

    /**
     * Lock key for syncronization
     *
     * @return string
     * @throws Exception
     */
    public function lockKey()
    {
        return $this->getId();
    }

    /**
     * @return string
     * @throws Exception
     */
    public function getState()
    {
        return $this->get('state');
    }

    /**
     * @return string
     * @throws Exception
     */
    public function getScope()
    {
        return $this->get('scope');
    }

    /**
     * @return string
     * @throws Exception
     */
    public function getInfo()
    {
        return $this->get('info');
    }

    /**
     * @return string
     * @throws Exception
     */
    public function getData()
    {
        return $this->get('data');
    }
}
