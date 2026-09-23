<?php

return [
    'templates' => [
        "New senior video editor joining marketing. Needs to edit 4K footage in Premiere/After Effects and travels frequently between shoots." => [
            "min_cpu_tier" => "high",
            "min_ram_gb" => 32,
            "min_storage_gb" => 1024,
            "requires_gpu" => true,
            "min_gpu_tier" => "dedicated-high",
            "portability_required" => true
        ],
        "Backend software engineer working with Docker microservices, compiling Rust and running local databases. Needs 32GB RAM and portability." => [
            "min_cpu_tier" => "high",
            "min_ram_gb" => 32,
            "min_storage_gb" => 512,
            "requires_gpu" => false,
            "min_gpu_tier" => "none",
            "portability_required" => true
        ],
        "Data analyst doing heavy SQL querying and Tableau visualization from office desk. No GPU needed, prefers desktop." => [
            "min_cpu_tier" => "mid",
            "min_ram_gb" => 16,
            "min_storage_gb" => 512,
            "requires_gpu" => false,
            "min_gpu_tier" => "none",
            "portability_required" => false
        ],
        "HR specialist handling spreadsheets, web apps, and emails. Basic productivity laptop." => [
            "min_cpu_tier" => "entry",
            "min_ram_gb" => 8,
            "min_storage_gb" => 256,
            "requires_gpu" => false,
            "min_gpu_tier" => "none",
            "portability_required" => false
        ],
    ]
];
