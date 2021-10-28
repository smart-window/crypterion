<?php

namespace HolluwaTosin360\Ssr\Engines;

use HolluwaTosin360\Ssr\Engine;
use HolluwaTosin360\Ssr\Exceptions\EngineError;
use Symfony\Component\Process\Process;

class Node implements Engine
{
	/** @var string */
	protected $nodePath;

	/** @var string */
	protected $tempPath;

	public function __construct(string $nodePath, string $tempPath)
	{
		$this->nodePath = $nodePath;
		$this->tempPath = $tempPath;
	}

	public function run(string $script, $env): string
	{
		try {
			$tempFilePath = $this->createTempFilePath();
			file_put_contents($tempFilePath, $script);

			$process = new Process([$this->nodePath, $tempFilePath], null, $env);
			return substr($process->mustRun()->getOutput(), 0, -1);
		} catch (\Exception $exception) {
			throw EngineError::withException($exception);
		} finally {
			if (isset($tempFilePath) && file_exists($tempFilePath)) {
				unlink($tempFilePath);
			}
		}
	}

	public function getDispatchHandler(): string
	{
		return 'console.log';
	}

	/**
	 * @return string
	 * @throws \Exception
	 */
	protected function createTempFilePath(): string
	{
		return implode(DIRECTORY_SEPARATOR, [
			$this->tempPath,
			md5(intval(microtime(true) * 1000) . random_bytes(5)) . '.js'
		]);
	}
}
