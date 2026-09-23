<?php

namespace App\Http\Controllers;

use App\Services\MatchingService;
use Inertia\Inertia;
use Inertia\Response;

class MismatchController extends Controller
{
    public function index(MatchingService $matchingService): Response
    {
        $mismatches = $matchingService->detectMismatches();

        return Inertia::render('Mismatches/Index', [
            'mismatches' => $mismatches,
            'threshold' => MatchingService::MATCH_THRESHOLD,
        ]);
    }
}
