<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * Accepts one or more role names separated by commas.
     * Example usage in routes: ->middleware('role:admin,manager')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized.');
        }

        $allowedRoles = array_filter(array_map(
            fn (string $role) => UserRole::tryFrom(trim($role)),
            $roles
        ));

        if (empty($allowedRoles) || ! in_array($user->role, $allowedRoles, true)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
