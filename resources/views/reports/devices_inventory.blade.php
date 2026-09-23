<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SpecMatch ITAM - Enterprise Asset Inventory Audit</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #1e293b;
            margin: 0;
            padding: 10px 15px;
        }
        .header {
            margin-bottom: 15px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 8px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
        }
        .subtitle {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 15px;
        }
        .meta-table td {
            padding: 3px 0;
            font-size: 9px;
            color: #475569;
        }
        .stat-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 12px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        table.data-table th {
            background-color: #f1f5f9;
            color: #334155;
            font-size: 9px;
            font-weight: bold;
            text-align: left;
            padding: 6px 8px;
            border-bottom: 1px solid #cbd5e1;
            text-transform: uppercase;
        }
        table.data-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 9px;
            color: #334155;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .badge {
            display: inline-block;
            padding: 2px 5px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 3px;
            text-transform: uppercase;
        }
        .badge-available { background-color: #ecfdf5; color: #047857; }
        .badge-assigned { background-color: #eff6ff; color: #1d4ed8; }
        .badge-in_repair { background-color: #fffbeb; color: #b45309; }
        .badge-retired { background-color: #f1f5f9; color: #475569; }
        .footer {
            margin-top: 20px;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            font-size: 8px;
            color: #94a3b8;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <table style="width: 100%;">
            <tr>
                <td>
                    <div class="title">SpecMatch ITAM — Enterprise Asset Inventory & Audit Report</div>
                    <div class="subtitle">Philippine Enterprise Hardware Optimization & Lifecycle Tracking</div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                    <span style="font-weight: bold; color: #4f46e5; font-size: 12px;">AppCon 2026</span><br>
                    <span style="font-size: 9px; color: #64748b;">Code Titans (Team 10)</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="stat-box">
        <table style="width: 100%;">
            <tr>
                <td style="width: 25%;">
                    <strong>Total Hardware Assets:</strong> {{ $total_assets }} units
                </td>
                <td style="width: 35%;">
                    <strong>Total Fleet Book Value:</strong> ₱{{ number_format($total_value, 2) }}
                </td>
                <td style="width: 40%; text-align: right;">
                    <strong>Report Generated:</strong> {{ $generated_at }}
                </td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 10%;">Asset Tag</th>
                <th style="width: 22%;">Hardware Device & Specs</th>
                <th style="width: 22%;">Greater Metro Manila Location</th>
                <th style="width: 14%;">Active Assignment</th>
                <th style="width: 10%;">Lifecycle Stage</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 12%; text-align: right;">Book Value (₱)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($devices as $device)
                <tr>
                    <td>
                        <strong>{{ $device->asset_tag }}</strong><br>
                        <span style="color: #64748b; font-size: 8px;">{{ $device->serial_number }}</span>
                    </td>
                    <td>
                        <strong>{{ $device->brand }} {{ $device->model }}</strong><br>
                        <span style="color: #64748b; font-size: 8px;">
                            {{ $device->cpu }} &bull; {{ $device->ram_gb }}GB RAM &bull; {{ $device->storage_gb }}GB {{ $device->storage_type }}
                        </span>
                    </td>
                    <td>
                        <span style="font-size: 8.5px;">{{ $device->location }}</span>
                    </td>
                    <td>
                        @if ($device->activeAssignment)
                            <strong>{{ $device->activeAssignment->employee->name }}</strong><br>
                            <span style="color: #64748b; font-size: 8px;">{{ $device->activeAssignment->employee->department }}</span>
                        @else
                            <span style="color: #94a3b8; font-style: italic;">Unassigned (Depot)</span>
                        @endif
                    </td>
                    <td>
                        <span style="text-transform: capitalize;">{{ $device->lifecycle_stage }}</span>
                    </td>
                    <td>
                        <span class="badge badge-{{ $device->status }}">
                            {{ str_replace('_', ' ', $device->status) }}
                        </span>
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                        ₱{{ number_format($device->current_book_value, 2) }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Generated automatically by SpecMatch Enterprise ITAM Platform &bull; ISO 19770-1 IT Asset Compliance Standard &bull; Page 1 of 1
    </div>
</body>
</html>
