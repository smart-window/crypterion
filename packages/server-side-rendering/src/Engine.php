<?php

namespace HolluwaTosin360\Ssr;

interface Engine
{
    public function run(string $script, $env): string;

    public function getDispatchHandler(): string;
}
