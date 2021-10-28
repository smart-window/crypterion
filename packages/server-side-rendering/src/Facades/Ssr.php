<?php

namespace HolluwaTosin360\Ssr\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \HolluwaTosin360\Ssr\Renderer
 */
class Ssr extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'ssr';
    }
}
