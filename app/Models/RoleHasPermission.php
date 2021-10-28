<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleHasPermission extends Model
{
	public function permission()
	{
		return $this->belongsTo(Permission::class, 'permission_id', 'id');
	}

	public function role()
	{
		return $this->belongsTo(Role::class, 'role_id', 'id');
	}
}
