<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModelHasPermission extends Model
{
    public function permission()
    {
    	return $this->belongsTo(Permission::class, 'permission_id', 'id');
    }
}
