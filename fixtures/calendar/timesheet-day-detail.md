Description: API get timesheet day detail.

# Request example 1

## From original system (kaopiz)

API: GET https://api.hrm.kaopiz.com/api/timesheets/owner-calendar-details?date=2026-07-31

Payload:

Response:
```
{
    "timeSheets": [
        {
            "id": 3440873,
            "time": "2026-07-31 09:05:12",
            "machine_code": "M8"
        },
        {
            "id": 3439889,
            "time": "2026-07-31 09:07:15",
            "machine_code": "FACE08"
        },
        {
            "id": 3439890,
            "time": "2026-07-31 09:07:18",
            "machine_code": "FACE08"
        },
        {
            "id": 3442450,
            "time": "2026-07-31 15:55:34",
            "machine_code": "T4_aws_out"
        },
        {
            "id": 3442436,
            "time": "2026-07-31 15:55:58",
            "machine_code": "T4_aws_in"
        }
    ],
    "application_forms": [
        {
            "id": 119164,
            "type_id": 1,
            "project_id": null,
            "start_date": "2026-07-31 00:00:00",
            "end_date": "2026-07-31 00:00:00",
            "status": 3,
            "data": {
                "reason_id": 4,
                "tracking_times": [
                    {
                        "date_end": "2026-07-31",
                        "time_end": "17:30",
                        "count_hour": 1.583333333333334,
                        "date_start": "2026-07-31",
                        "time_start": "15:55"
                    }
                ],
                "annual_leave_used": {
                    "last_year": 0,
                    "this_year": 0.1979
                }
            },
            "type": {
                "id": 1,
                "name": "\u0110\u01a1n xin ngh\u1ec9"
            }
        },
        {
            "id": 119275,
            "type_id": 1,
            "project_id": null,
            "start_date": "2026-07-31 00:00:00",
            "end_date": "2026-07-31 00:00:00",
            "status": 1,
            "data": {
                "reason_id": 4,
                "tracking_times": [
                    {
                        "date_end": "2026-07-31",
                        "time_end": "08:55",
                        "count_hour": 0.4166666666666661,
                        "date_start": "2026-07-31",
                        "time_start": "08:30"
                    }
                ]
            },
            "type": {
                "id": 1,
                "name": "\u0110\u01a1n xin ngh\u1ec9"
            }
        }
    ]
}
```

## From this system (kaopiz-ex). This system call the original system.

API: https://kaopiz-ex-api.vngou.online/timesheet/day-detail?date=2026-07-31

Payload:

Response:
```
{
    "success": true,
    "data": {
        "timeSheets": [
            {
                "id": 3440873,
                "time": "2026-07-31T09:05:12.000Z",
                "machineCode": "M8"
            },
            {
                "id": 3439889,
                "time": "2026-07-31T09:07:15.000Z",
                "machineCode": "FACE08"
            },
            {
                "id": 3439890,
                "time": "2026-07-31T09:07:18.000Z",
                "machineCode": "FACE08"
            },
            {
                "id": 3442450,
                "time": "2026-07-31T15:55:34.000Z",
                "machineCode": "T4_aws_out"
            },
            {
                "id": 3442436,
                "time": "2026-07-31T15:55:58.000Z",
                "machineCode": "T4_aws_in"
            }
        ],
        "applicationForms": [
            {
                "id": 119164,
                "typeId": 1,
                "projectId": null,
                "startDate": "2026-07-31T00:00:00.000Z",
                "endDate": "2026-07-31T00:00:00.000Z",
                "status": 3,
                "data": {
                    "trackingTimes": [
                        {
                            "timeStart": "15:55",
                            "timeEnd": "17:30"
                        }
                    ]
                },
                "type": {
                    "id": 1,
                    "name": "Đơn xin nghỉ"
                }
            },
            {
                "id": 119275,
                "typeId": 1,
                "projectId": null,
                "startDate": "2026-07-31T00:00:00.000Z",
                "endDate": "2026-07-31T00:00:00.000Z",
                "status": 1,
                "data": {
                    "trackingTimes": [
                        {
                            "timeStart": "08:30",
                            "timeEnd": "08:55"
                        }
                    ]
                },
                "type": {
                    "id": 1,
                    "name": "Đơn xin nghỉ"
                }
            }
        ]
    }
}
```

# Request example 2

## From original system (kaopiz)

API: GET https://api.hrm.kaopiz.com/api/timesheets/owner-calendar-details?date=2026-04-16

Payload:

Response:
```
{
    "timeSheets": [
        {
            "id": 3008335,
            "time": "2026-04-16 08:45:17",
            "machine_code": "T4_aws_in"
        },
        {
            "id": 3008323,
            "time": "2026-04-16 08:45:33",
            "machine_code": "T4_aws_out"
        },
        {
            "id": 3010619,
            "time": "2026-04-16 12:10:23",
            "machine_code": "T4_aws_in"
        },
        {
            "id": 3010694,
            "time": "2026-04-16 13:50:08",
            "machine_code": "T4_aws_out"
        }
    ],
    "application_forms": [
        {
            "id": 102878,
            "type_id": 4,
            "project_id": null,
            "start_date": "2026-04-16 00:00:00",
            "end_date": "2026-04-16 00:00:00",
            "status": 3,
            "data": {
                "tracking_times": [
                    {
                        "date": "2026-04-16",
                        "time": "17:30",
                        "reason_id": 25
                    }
                ]
            },
            "type": {
                "id": 4,
                "name": "\u0110\u01a1n checkin\/out"
            }
        },
        {
            "id": 102880,
            "type_id": 2,
            "project_id": null,
            "start_date": "2026-04-16 00:00:00",
            "end_date": "2026-04-16 00:00:00",
            "status": 3,
            "data": {
                "tracking_times": [
                    {
                        "date": "2026-04-16",
                        "time_end": "08:45",
                        "reason_id": 21,
                        "time_start": "08:30"
                    }
                ]
            },
            "type": {
                "id": 2,
                "name": "\u0110\u01a1n v\u1eafng m\u1eb7t"
            }
        }
    ]
}
```

## From this system (kaopiz-ex). This system call the original system.

API: https://kaopiz-ex-api.vngou.online/timesheet/day-detail?date=2026-04-16

Payload:

Response:
```
{
    "success": true,
    "data": {
        "timeSheets": [
            {
                "id": 3008335,
                "time": "2026-04-16T08:45:17.000Z",
                "machineCode": "T4_aws_in"
            },
            {
                "id": 3008323,
                "time": "2026-04-16T08:45:33.000Z",
                "machineCode": "T4_aws_out"
            },
            {
                "id": 3010619,
                "time": "2026-04-16T12:10:23.000Z",
                "machineCode": "T4_aws_in"
            },
            {
                "id": 3010694,
                "time": "2026-04-16T13:50:08.000Z",
                "machineCode": "T4_aws_out"
            }
        ],
        "applicationForms": [
            {
                "id": 102878,
                "typeId": 4,
                "projectId": null,
                "startDate": "2026-04-16T00:00:00.000Z",
                "endDate": "2026-04-16T00:00:00.000Z",
                "status": 3,
                "data": {
                    "trackingTimes": [
                        {
                            "date": "2026-04-16",
                            "reasonId": 25
                        }
                    ]
                },
                "type": {
                    "id": 4,
                    "name": "Đơn checkin/out"
                }
            },
            {
                "id": 102880,
                "typeId": 2,
                "projectId": null,
                "startDate": "2026-04-16T00:00:00.000Z",
                "endDate": "2026-04-16T00:00:00.000Z",
                "status": 3,
                "data": {
                    "trackingTimes": [
                        {
                            "date": "2026-04-16",
                            "timeStart": "08:30",
                            "timeEnd": "08:45",
                            "reasonId": 21
                        }
                    ]
                },
                "type": {
                    "id": 2,
                    "name": "Đơn vắng mặt"
                }
            }
        ]
    }
}
```
