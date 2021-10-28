<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModelHasRole extends Model
{
	public function role()
	{
		return $this->belongsTo(Role::class, 'role_id', 'id');
	}
}
