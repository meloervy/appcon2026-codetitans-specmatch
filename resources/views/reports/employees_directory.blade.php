<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SpecMatch ITAM - Company Staff Directory & Hardware Allocation Audit</title>
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
            border-bottom: 2px solid #026eff;
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
        .stat-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 12px;
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
            padding: 2px 6px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 3px;
        }
        .badge-assigned { background-color: #eff6ff; color: #026eff; border: 1px solid #bfdbfe; }
        .badge-unassigned { background-color: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
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
                    <div class="title">SpecMatch ITAM — Staff Directory & Hardware Allocation Report</div>
                    <div class="subtitle">Philippine Enterprise Hardware Optimization & Workforce Asset Tracking</div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                    <span style="font-weight: bold; color: #026eff; font-size: 12px;">AppCon 2026</span><br>
                    <span style="font-size: 9px; color: #64748b;">Code Titans (Team 10)</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="stat-box">
        <table style="width: 100%;">
            <tr>
                <td style="width: 25%;">
                    <strong>Total Employees:</strong> {{ $total_employees }} staff
                </td>
                <td style="width: 25%;">
                    <strong>Equipped Units:</strong> {{ $assigned_count }} ({{ $total_employees > 0 ? round(($assigned_count / $total_employees) * 100) : 0 }}%)
                </td>
                <td style="width: 25%;">
                    <strong>Unassigned:</strong> {{ $total_employees - $assigned_count }}
                </td>
                <td style="width: 25%; text-align: right;">
                    <strong>Generated:</strong> {{ $generated_at }}
                </td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 8%;">ID</th>
                <th style="width: 20%;">Employee Name</th>
                <th style="width: 16%;">Department</th>
                <th style="width: 18%;">Role Profile</th>
                <th style="width: 26%;">Assigned Hardware & Specs</th>
                <th style="width: 12%;">Allocation</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($employees as $emp)
                @php
                    $device = $emp->activeAssignment?->device;
                @endphp
                <tr>
                    <td><strong>#{{ str_pad($emp->id, 4, '0', STR_PAD_LEFT) }}</strong></td>
                    <td>
                        <strong>{{ $emp->name }}</strong>
                    </td>
                    <td>{{ $emp->department }}</td>
                    <td>
                        @if ($emp->roleProfile)
                            <span>{{ $emp->roleProfile->name }}</span>
                        @else
                            <span style="color: #94a3b8; font-style: italic;">No Profile</span>
                        @endif
                    </td>
                    <td>
                        @if ($device)
                            <strong>{{ $device->asset_tag }}</strong> &bull; {{ $device->brand }} {{ $device->model }}<br>
                            <span style="color: #64748b; font-size: 8px;">
                                {{ $device->ram_gb }}GB RAM &bull; {{ $device->storage_gb }}GB {{ $device->storage_type }} &bull; {{ ucfirst($device->device_type) }}
                            </span>
                        @else
                            <span style="color: #94a3b8; font-style: italic;">No Device Issued</span>
                        @endif
                    </td>
                    <td>
                        @if ($device)
                            <span class="badge badge-assigned">Assigned</span>
                        @else
                            <span class="badge badge-unassigned">Needs Device</span>
                        @endif
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
