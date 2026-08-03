Description: API get timesheet calendar.

# Request example 1

## From original system (kaopiz)

API: GET https://api.hrm.kaopiz.com/api/timesheets/owner-calendar?month_year=07-2026

Payload:

Response:
```
{
    "user_id": 861,
    "user_code": "KP.00442",
    "user_full_name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
    "user_full_name_katakana": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
    "user_email": "vuongdh@kaopiz.com",
    "user_kjp": null,
    "department_id": 7,
    "contract_department_id": 2,
    "senior_managements": null,
    "working_time": {
        "id": 2,
        "name": "Kaopiz Vi\u1ec7t Nam",
        "work_start": "08:30",
        "work_end": "17:30",
        "lunch_start": "12:00",
        "lunch_end": "13:00",
        "dinner_start": "17:30",
        "dinner_end": "18:00",
        "working_hours_per_day": 8,
        "working_hours_per_shift": 8,
        "minutes_early_late_allowed": 90,
        "timezone": "VN",
        "created_at": "2024-08-06T04:18:55.000000Z",
        "updated_at": "2024-08-06T04:18:55.000000Z",
        "lunch_break_time": 60,
        "dinner_break_time": 30,
        "day_of_week": 0,
        "timezone_value": "Asia\/Ho_Chi_Minh"
    },
    "timelines": [
        {
            "date": "2026-07-01",
            "time_in": "08:42",
            "time_out": "19:39",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:42",
            "time_out_final": "19:39",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.8,
            "work_start": "08:42",
            "work_end": "17:30",
            "minutes_late": 12,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17985942,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-01",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-02",
            "time_in": "08:53",
            "time_out": "18:26",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:26",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 114150,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-02 00:00:00",
                    "end_date": "2026-07-02 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-02",
                                "time_end": "08:53",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-07-06T02:11:45.000000Z"
                }
            ],
            "log_work": {
                "id": 17985957,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-02",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-03",
            "time_in": "08:37",
            "time_out": "18:19",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:37",
            "time_out_final": "18:19",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.8833,
            "work_start": "08:37",
            "work_end": "17:30",
            "minutes_late": 7,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17985963,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-03",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-04",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-05",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-06",
            "time_in": "08:32",
            "time_out": "18:44",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:32",
            "time_out_final": "18:44",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.9667,
            "work_start": "08:32",
            "work_end": "17:30",
            "minutes_late": 2,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17985978,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-06",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-07",
            "time_in": "08:37",
            "time_out": "18:07",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:37",
            "time_out_final": "18:07",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.8833,
            "work_start": "08:37",
            "work_end": "17:30",
            "minutes_late": 7,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17985994,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-07",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-08",
            "time_in": "08:40",
            "time_out": "17:51",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:40",
            "time_out_final": "17:51",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.8333,
            "work_start": "08:40",
            "work_end": "17:30",
            "minutes_late": 10,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17986010,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-08",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-09",
            "time_in": "08:44",
            "time_out": "18:04",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:04",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 115282,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-09 00:00:00",
                    "end_date": "2026-07-09 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-09",
                                "time_end": "08:44",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-07-13T02:03:52.000000Z"
                }
            ],
            "log_work": {
                "id": 17986017,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-09",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-10",
            "time_in": "08:45",
            "time_out": "18:11",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:11",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 115281,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-10 00:00:00",
                    "end_date": "2026-07-10 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-10",
                                "time_end": "08:45",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-07-13T02:03:51.000000Z"
                }
            ],
            "log_work": {
                "id": 17986032,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-10",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-11",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-12",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-13",
            "time_in": "08:47",
            "time_out": "19:06",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:47",
            "time_out_final": "19:06",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.7167,
            "work_start": "08:47",
            "work_end": "17:30",
            "minutes_late": 17,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17986049,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-13",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-14",
            "time_in": "08:42",
            "time_out": "18:19",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:42",
            "time_out_final": "18:19",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.8,
            "work_start": "08:42",
            "work_end": "17:30",
            "minutes_late": 12,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17986065,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-14",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-15",
            "time_in": "09:14",
            "time_out": "18:14",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:14",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 116592,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-15 00:00:00",
                    "end_date": "2026-07-15 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-15",
                                "time_end": "09:14",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-07-20T04:34:06.000000Z"
                }
            ],
            "log_work": {
                "id": 17986080,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-15",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-16",
            "time_in": "08:43",
            "time_out": "18:31",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:43",
            "time_out_final": "18:31",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.7833,
            "work_start": "08:43",
            "work_end": "17:30",
            "minutes_late": 13,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17986087,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-16",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-17",
            "time_in": "09:03",
            "time_out": "19:02",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "19:02",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 116593,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-17 00:00:00",
                    "end_date": "2026-07-17 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-17",
                                "time_end": "09:03",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-07-20T04:34:07.000000Z"
                }
            ],
            "log_work": {
                "id": 17986103,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-17",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-18",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-19",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-20",
            "time_in": "09:25",
            "time_out": "18:03",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:03",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 117752,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-20 00:00:00",
                    "end_date": "2026-07-20 00:00:00",
                    "data": {
                        "tracking_times": [
                            {
                                "date": "2026-07-20",
                                "time_end": "09:03",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-07-27T05:25:03.000000Z"
                }
            ],
            "log_work": {
                "id": 17986117,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-20",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-21",
            "time_in": "08:51",
            "time_out": "18:11",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:11",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 117755,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-07-21 00:00:00",
                    "end_date": "2026-07-21 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-07-21",
                                "time_end": "08:51",
                                "count_hour": 0.34999999999999964,
                                "date_start": "2026-07-21",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0438
                        }
                    },
                    "created_at": "2026-07-27T05:25:58.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17986132,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-21",
                "time_spent_hour": 8
            },
            "log_work_diff": 0.35,
            "log_work_needed": 7.65
        },
        {
            "date": "2026-07-22",
            "time_in": "09:05",
            "time_out": "19:07",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "19:07",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 117753,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-22 00:00:00",
                    "end_date": "2026-07-22 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-22",
                                "time_end": "09:05",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-07-27T05:25:56.000000Z"
                }
            ],
            "log_work": {
                "id": 17986140,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-22",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-23",
            "time_in": "08:51",
            "time_out": "18:48",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:48",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 117754,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-07-23 00:00:00",
                    "end_date": "2026-07-23 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-07-23",
                                "time_end": "08:51",
                                "count_hour": 0.34999999999999964,
                                "date_start": "2026-07-23",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0438
                        }
                    },
                    "created_at": "2026-07-27T05:25:57.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17986146,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-23",
                "time_spent_hour": 8
            },
            "log_work_diff": 0.35,
            "log_work_needed": 7.65
        },
        {
            "date": "2026-07-24",
            "time_in": "08:43",
            "time_out": "21:00",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "21:00",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 117756,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-07-24 00:00:00",
                    "end_date": "2026-07-24 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-07-24",
                                "time_end": "08:43",
                                "count_hour": 0.2166666666666668,
                                "date_start": "2026-07-24",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0271
                        }
                    },
                    "created_at": "2026-07-27T05:25:59.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17986162,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-24",
                "time_spent_hour": 8
            },
            "log_work_diff": 0.2167,
            "log_work_needed": 7.7833
        },
        {
            "date": "2026-07-25",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-26",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-07-27",
            "time_in": "08:49",
            "time_out": "19:23",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "19:23",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 119170,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-07-27 00:00:00",
                    "end_date": "2026-07-27 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-07-27",
                                "time_end": "08:49",
                                "count_hour": 0.31666666666666643,
                                "date_start": "2026-07-27",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0396
                        }
                    },
                    "created_at": "2026-08-03T02:08:39.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17986187,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-07-27",
                "time_spent_hour": 8
            },
            "log_work_diff": 0.3167,
            "log_work_needed": 7.6833
        },
        {
            "date": "2026-07-28",
            "time_in": "09:17",
            "time_out": "18:32",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:32",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 119167,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-28 00:00:00",
                    "end_date": "2026-07-28 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-28",
                                "time_end": "09:17",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-08-03T02:08:36.000000Z"
                }
            ],
            "log_work": null,
            "log_work_diff": -8,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-29",
            "time_in": "09:11",
            "time_out": "18:22",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:22",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 119168,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-07-29 00:00:00",
                    "end_date": "2026-07-29 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-07-29",
                                "time_end": "09:11",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-08-03T02:08:37.000000Z"
                }
            ],
            "log_work": null,
            "log_work_diff": -8,
            "log_work_needed": 8
        },
        {
            "date": "2026-07-30",
            "time_in": "08:53",
            "time_out": "19:01",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "19:01",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 119169,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-07-30 00:00:00",
                    "end_date": "2026-07-30 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-07-30",
                                "time_end": "08:53",
                                "count_hour": 0.38333333333333286,
                                "date_start": "2026-07-30",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0479
                        }
                    },
                    "created_at": "2026-08-03T02:08:38.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": null,
            "log_work_diff": -7.6167,
            "log_work_needed": 7.6167
        },
        {
            "date": "2026-07-31",
            "time_in": "09:05",
            "time_out": "15:55",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "09:05",
            "time_out_final": "17:30",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.4167,
            "work_start": "09:05",
            "work_end": "17:30",
            "minutes_late": 35,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 119164,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-07-31 00:00:00",
                    "end_date": "2026-07-31 00:00:00",
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
                    "created_at": "2026-08-03T02:07:52.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": null,
            "log_work_diff": -6.4167,
            "log_work_needed": 6.4167
        }
    ],
    "leave": {
        "health_insurance_leave": 0,
        "marriage_leave": 0,
        "filial_leave": 0,
        "unpaid_leave": 0,
        "annual_leave": 0.4,
        "unpaid_leave_without_application": 0,
        "total_unpaid": 0
    },
    "annual_leave_info": {
        "used": 0.4,
        "used_this_year": 4.2586,
        "available_this_year": -0.2591,
        "remaining_last_year": 0
    },
    "overtime": {
        "actual": 0,
        "multiplied_by_rate": 0,
        "compensatory_leave": 0
    },
    "absence": {
        "absence_compensatory_leave": 0
    },
    "working_start_date": "2022-05-30",
    "working_end_date": null,
    "summary": {
        "minutes_late": 115,
        "minutes_early": 0,
        "numbers_late": 9,
        "numbers_early": 0,
        "fines": 200000,
        "bonus": 0,
        "actual_working_day": 22.6,
        "timekeeping_holidays": 0,
        "missing_work_days": 0.05,
        "numbers_log_work_diff": 8
    },
    "total": {
        "work_hour": 182.0833,
        "work_day": 23,
        "standard_workday": 23,
        "actual_work_days": 22.95,
        "log_work_hour": 152,
        "log_work_diff": -28.8
    }
}
```

## From this system (kaopiz-ex). This system call the original system.

API: GET https://kaopiz-ex-api.vngou.online/timesheet/calendar?monthYear=07-2026

Payload:

Response:
```
{
    "success": true,
    "data": {
        "userId": 861,
        "userCode": "KP.00442",
        "userFullName": "Đỗ Huy Vượng",
        "userFullNameKatakana": "Đỗ Huy Vượng",
        "userEmail": "vuongdh@kaopiz.com",
        "departmentId": 7,
        "contractDepartmentId": 2,
        "seniorManagements": null,
        "workingTime": {
            "id": 2,
            "name": "Kaopiz Việt Nam",
            "workStart": "08:30",
            "workEnd": "17:30",
            "lunchStart": "12:00",
            "lunchEnd": "13:00",
            "dinnerStart": "17:30",
            "dinnerEnd": "18:00",
            "workingHoursPerDay": 8,
            "workingHoursPerShift": 8,
            "minutesEarlyLateAllowed": 90,
            "timezone": "VN",
            "createdAt": "2024-08-06T04:18:55.000Z",
            "updatedAt": "2024-08-06T04:18:55.000Z",
            "lunchBreakTime": 60,
            "dinnerBreakTime": 30,
            "dayOfWeek": 0,
            "timezoneValue": "Asia/Ho_Chi_Minh"
        },
        "timelines": [
            {
                "date": "2026-07-01T00:00:00.000Z",
                "timeIn": "08:42",
                "timeOut": "19:39",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:42",
                "timeOutFinal": "19:39",
                "work": "1",
                "workDays": 1,
                "workHours": 7.8,
                "workStart": "08:42",
                "workEnd": "17:30",
                "minutesLate": 12,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17985942,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-01T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-02T00:00:00.000Z",
                "timeIn": "08:53",
                "timeOut": "18:26",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:26",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 114150,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-02T00:00:00.000Z",
                        "endDate": "2026-07-02T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-02",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:53",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-07-06T02:11:45.000Z"
                    }
                ],
                "logWork": {
                    "id": 17985957,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-02T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-03T00:00:00.000Z",
                "timeIn": "08:37",
                "timeOut": "18:19",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:37",
                "timeOutFinal": "18:19",
                "work": "1",
                "workDays": 1,
                "workHours": 7.8833,
                "workStart": "08:37",
                "workEnd": "17:30",
                "minutesLate": 7,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17985963,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-03T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-04T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-05T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-06T00:00:00.000Z",
                "timeIn": "08:32",
                "timeOut": "18:44",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:32",
                "timeOutFinal": "18:44",
                "work": "1",
                "workDays": 1,
                "workHours": 7.9667,
                "workStart": "08:32",
                "workEnd": "17:30",
                "minutesLate": 2,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17985978,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-06T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-07T00:00:00.000Z",
                "timeIn": "08:37",
                "timeOut": "18:07",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:37",
                "timeOutFinal": "18:07",
                "work": "1",
                "workDays": 1,
                "workHours": 7.8833,
                "workStart": "08:37",
                "workEnd": "17:30",
                "minutesLate": 7,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17985994,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-07T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-08T00:00:00.000Z",
                "timeIn": "08:40",
                "timeOut": "17:51",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:40",
                "timeOutFinal": "17:51",
                "work": "1",
                "workDays": 1,
                "workHours": 7.8333,
                "workStart": "08:40",
                "workEnd": "17:30",
                "minutesLate": 10,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17986010,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-08T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-09T00:00:00.000Z",
                "timeIn": "08:44",
                "timeOut": "18:04",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:04",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 115282,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-09T00:00:00.000Z",
                        "endDate": "2026-07-09T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-09",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:44",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-07-13T02:03:52.000Z"
                    }
                ],
                "logWork": {
                    "id": 17986017,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-09T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-10T00:00:00.000Z",
                "timeIn": "08:45",
                "timeOut": "18:11",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:11",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 115281,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-10T00:00:00.000Z",
                        "endDate": "2026-07-10T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-10",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:45",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-07-13T02:03:51.000Z"
                    }
                ],
                "logWork": {
                    "id": 17986032,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-10T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-11T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-12T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-13T00:00:00.000Z",
                "timeIn": "08:47",
                "timeOut": "19:06",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:47",
                "timeOutFinal": "19:06",
                "work": "1",
                "workDays": 1,
                "workHours": 7.7167,
                "workStart": "08:47",
                "workEnd": "17:30",
                "minutesLate": 17,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17986049,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-13T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-14T00:00:00.000Z",
                "timeIn": "08:42",
                "timeOut": "18:19",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:42",
                "timeOutFinal": "18:19",
                "work": "1",
                "workDays": 1,
                "workHours": 7.8,
                "workStart": "08:42",
                "workEnd": "17:30",
                "minutesLate": 12,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17986065,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-14T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-15T00:00:00.000Z",
                "timeIn": "09:14",
                "timeOut": "18:14",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:14",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 116592,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-15T00:00:00.000Z",
                        "endDate": "2026-07-15T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-15",
                                    "timeStart": "08:30",
                                    "timeEnd": "09:14",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-07-20T04:34:06.000Z"
                    }
                ],
                "logWork": {
                    "id": 17986080,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-15T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-16T00:00:00.000Z",
                "timeIn": "08:43",
                "timeOut": "18:31",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:43",
                "timeOutFinal": "18:31",
                "work": "1",
                "workDays": 1,
                "workHours": 7.7833,
                "workStart": "08:43",
                "workEnd": "17:30",
                "minutesLate": 13,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17986087,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-16T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-17T00:00:00.000Z",
                "timeIn": "09:03",
                "timeOut": "19:02",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "19:02",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 116593,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-17T00:00:00.000Z",
                        "endDate": "2026-07-17T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-17",
                                    "timeStart": "08:30",
                                    "timeEnd": "09:03",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-07-20T04:34:07.000Z"
                    }
                ],
                "logWork": {
                    "id": 17986103,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-17T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-18T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-19T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-20T00:00:00.000Z",
                "timeIn": "09:25",
                "timeOut": "18:03",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:03",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 117752,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-20T00:00:00.000Z",
                        "endDate": "2026-07-20T00:00:00.000Z",
                        "data": {
                            "trackingTimes": [
                                {
                                    "date": "2026-07-20",
                                    "timeStart": "08:30",
                                    "timeEnd": "09:03",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-07-27T05:25:03.000Z"
                    }
                ],
                "logWork": {
                    "id": 17986117,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-20T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-21T00:00:00.000Z",
                "timeIn": "08:51",
                "timeOut": "18:11",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:11",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 117755,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-07-21T00:00:00.000Z",
                        "endDate": "2026-07-21T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-07-21",
                                    "dateEnd": "2026-07-21",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:51",
                                    "countHour": 0.34999999999999964
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0438
                            }
                        },
                        "createdAt": "2026-07-27T05:25:58.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17986132,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-21T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0.35,
                "logWorkNeeded": 7.65
            },
            {
                "date": "2026-07-22T00:00:00.000Z",
                "timeIn": "09:05",
                "timeOut": "19:07",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "19:07",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 117753,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-22T00:00:00.000Z",
                        "endDate": "2026-07-22T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-22",
                                    "timeStart": "08:30",
                                    "timeEnd": "09:05",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-07-27T05:25:56.000Z"
                    }
                ],
                "logWork": {
                    "id": 17986140,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-22T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-23T00:00:00.000Z",
                "timeIn": "08:51",
                "timeOut": "18:48",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:48",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 117754,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-07-23T00:00:00.000Z",
                        "endDate": "2026-07-23T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-07-23",
                                    "dateEnd": "2026-07-23",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:51",
                                    "countHour": 0.34999999999999964
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0438
                            }
                        },
                        "createdAt": "2026-07-27T05:25:57.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17986146,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-23T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0.35,
                "logWorkNeeded": 7.65
            },
            {
                "date": "2026-07-24T00:00:00.000Z",
                "timeIn": "08:43",
                "timeOut": "21:00",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "21:00",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 117756,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-07-24T00:00:00.000Z",
                        "endDate": "2026-07-24T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-07-24",
                                    "dateEnd": "2026-07-24",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:43",
                                    "countHour": 0.2166666666666668
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0271
                            }
                        },
                        "createdAt": "2026-07-27T05:25:59.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17986162,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-24T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0.2167,
                "logWorkNeeded": 7.7833
            },
            {
                "date": "2026-07-25T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-26T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-07-27T00:00:00.000Z",
                "timeIn": "08:49",
                "timeOut": "19:23",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "19:23",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 119170,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-07-27T00:00:00.000Z",
                        "endDate": "2026-07-27T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-07-27",
                                    "dateEnd": "2026-07-27",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:49",
                                    "countHour": 0.31666666666666643
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0396
                            }
                        },
                        "createdAt": "2026-08-03T02:08:39.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17986187,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-07-27T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0.3167,
                "logWorkNeeded": 7.6833
            },
            {
                "date": "2026-07-28T00:00:00.000Z",
                "timeIn": "09:17",
                "timeOut": "18:32",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:32",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 119167,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-28T00:00:00.000Z",
                        "endDate": "2026-07-28T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-28",
                                    "timeStart": "08:30",
                                    "timeEnd": "09:17",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-08-03T02:08:36.000Z"
                    }
                ],
                "logWork": null,
                "logWorkDiff": -8,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-29T00:00:00.000Z",
                "timeIn": "09:11",
                "timeOut": "18:22",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:22",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 119168,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-07-29T00:00:00.000Z",
                        "endDate": "2026-07-29T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-07-29",
                                    "timeStart": "08:30",
                                    "timeEnd": "09:11",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-08-03T02:08:37.000Z"
                    }
                ],
                "logWork": null,
                "logWorkDiff": -8,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-07-30T00:00:00.000Z",
                "timeIn": "08:53",
                "timeOut": "19:01",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "19:01",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 119169,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-07-30T00:00:00.000Z",
                        "endDate": "2026-07-30T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-07-30",
                                    "dateEnd": "2026-07-30",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:53",
                                    "countHour": 0.38333333333333286
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0479
                            }
                        },
                        "createdAt": "2026-08-03T02:08:38.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": null,
                "logWorkDiff": -7.6167,
                "logWorkNeeded": 7.6167
            },
            {
                "date": "2026-07-31T00:00:00.000Z",
                "timeIn": "09:05",
                "timeOut": "15:55",
                "symbol": "P",
                "location": "",
                "timeInFinal": "09:05",
                "timeOutFinal": "17:30",
                "work": "1",
                "workDays": 1,
                "workHours": 7.4167,
                "workStart": "09:05",
                "workEnd": "17:30",
                "minutesLate": 35,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 119164,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-07-31T00:00:00.000Z",
                        "endDate": "2026-07-31T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-07-31",
                                    "dateEnd": "2026-07-31",
                                    "timeStart": "15:55",
                                    "timeEnd": "17:30",
                                    "countHour": 1.583333333333334
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.1979
                            }
                        },
                        "createdAt": "2026-08-03T02:07:52.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": null,
                "logWorkDiff": -6.4167,
                "logWorkNeeded": 6.4167
            }
        ],
        "leave": {
            "healthInsuranceLeave": 0,
            "marriageLeave": 0,
            "filialLeave": 0,
            "unpaidLeave": 0,
            "annualLeave": 0.4,
            "unpaidLeaveWithoutApplication": 0,
            "totalUnpaid": 0
        },
        "annualLeaveInfo": {
            "used": 0.4,
            "usedThisYear": 4.2586,
            "availableThisYear": -0.2591,
            "remainingLastYear": 0
        },
        "overtime": {
            "actual": 0,
            "multipliedByRate": 0,
            "compensatoryLeave": 0
        },
        "absence": {
            "absenceCompensatoryLeave": 0
        },
        "workingStartDate": "2022-05-30T00:00:00.000Z",
        "workingEndDate": null,
        "summary": {
            "minutesLate": 115,
            "minutesEarly": 0,
            "numbersLate": 9,
            "numbersEarly": 0,
            "fines": 200000,
            "bonus": 0,
            "actualWorkingDay": 22.6,
            "timekeepingHolidays": 0,
            "numbersLogWorkDiff": 8
        },
        "total": {
            "workHour": 182.0833,
            "workDay": 23,
            "standardWorkday": 23,
            "logWorkHour": 152,
            "logWorkDiff": -28.8
        }
    }
}
```

# Request example 2

## From original system (kaopiz)

API: GET https://api.hrm.kaopiz.com/api/timesheets/owner-calendar?month_year=04-2026

Payload:

Response:
```
{
    "user_id": 861,
    "user_code": "KP.00442",
    "user_full_name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
    "user_full_name_katakana": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
    "user_email": "vuongdh@kaopiz.com",
    "user_kjp": null,
    "department_id": 7,
    "contract_department_id": 2,
    "senior_managements": null,
    "working_time": {
        "id": 2,
        "name": "Kaopiz Vi\u1ec7t Nam",
        "work_start": "08:30",
        "work_end": "17:30",
        "lunch_start": "12:00",
        "lunch_end": "13:00",
        "dinner_start": "17:30",
        "dinner_end": "18:00",
        "working_hours_per_day": 8,
        "working_hours_per_shift": 8,
        "minutes_early_late_allowed": 90,
        "timezone": "VN",
        "created_at": "2024-08-06T04:18:55.000000Z",
        "updated_at": "2024-08-06T04:18:55.000000Z",
        "lunch_break_time": 60,
        "dinner_break_time": 30,
        "day_of_week": 0,
        "timezone_value": "Asia\/Ho_Chi_Minh"
    },
    "timelines": [
        {
            "date": "2026-04-01",
            "time_in": "08:50",
            "time_out": "19:27",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:50",
            "time_out_final": "19:27",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.6667,
            "work_start": "08:50",
            "work_end": "17:30",
            "minutes_late": 20,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17238512,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-01",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-02",
            "time_in": "09:26",
            "time_out": "18:37",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:37",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 100261,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-02 00:00:00",
                    "end_date": "2026-04-02 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-04-02",
                                "time_end": "09:26",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-04-05T15:42:34.000000Z"
                }
            ],
            "log_work": {
                "id": 17238519,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-02",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-03",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "17:30",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 100919,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-04-03 00:00:00",
                    "end_date": "2026-04-03 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-04-03",
                                "time_end": "17:30",
                                "reason_id": 4,
                                "count_hour": 8,
                                "date_start": "2026-04-03",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 1
                        }
                    },
                    "created_at": "2026-04-09T07:13:37.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-04",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-05",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-06",
            "time_in": "08:44",
            "time_out": "18:41",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:44",
            "time_out_final": "18:41",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.7667,
            "work_start": "08:44",
            "work_end": "17:30",
            "minutes_late": 14,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17238534,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-06",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-07",
            "time_in": "08:50",
            "time_out": "18:35",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:35",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 101059,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-07 00:00:00",
                    "end_date": "2026-04-07 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-04-07",
                                "time_end": "08:50",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-04-10T02:48:58.000000Z"
                }
            ],
            "log_work": {
                "id": 17238542,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-07",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-08",
            "time_in": "08:44",
            "time_out": "18:22",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:22",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 101060,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-08 00:00:00",
                    "end_date": "2026-04-08 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-04-08",
                                "time_end": "08:44",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-04-10T02:48:59.000000Z"
                }
            ],
            "log_work": {
                "id": 17238550,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-08",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-09",
            "time_in": "08:42",
            "time_out": "19:27",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:42",
            "time_out_final": "19:27",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.8,
            "work_start": "08:42",
            "work_end": "17:30",
            "minutes_late": 12,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17238558,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-09",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-10",
            "time_in": "08:33",
            "time_out": "21:24",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:33",
            "time_out_final": "21:24",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.95,
            "work_start": "08:33",
            "work_end": "17:30",
            "minutes_late": 3,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17238565,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-10",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-11",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-12",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-13",
            "time_in": "08:38",
            "time_out": "17:40",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:38",
            "time_out_final": "17:40",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.8667,
            "work_start": "08:38",
            "work_end": "17:30",
            "minutes_late": 8,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17238573,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-13",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-14",
            "time_in": "08:52",
            "time_out": "22:29",
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": "08:52",
            "time_out_final": "22:29",
            "work": "1",
            "work_days": 1,
            "work_hours": 7.6333,
            "work_start": "08:52",
            "work_end": "17:30",
            "minutes_late": 22,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": {
                "id": 17238581,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-14",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-15",
            "time_in": "11:49",
            "time_out": "19:38",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "19:38",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 102855,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-04-15 00:00:00",
                    "end_date": "2026-04-15 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-04-15",
                                "time_end": "11:49",
                                "reason_id": 4,
                                "count_hour": 3.3166666666666664,
                                "date_start": "2026-04-15",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.4146
                        }
                    },
                    "created_at": "2026-04-22T02:28:12.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17238589,
                "user_id": 861,
                "time_spent": 16200,
                "date": "2026-04-15",
                "time_spent_hour": 4.5
            },
            "log_work_diff": -0.1833,
            "log_work_needed": 4.6833
        },
        {
            "date": "2026-04-16",
            "time_in": "08:45",
            "time_out": "13:50",
            "time_off_type": 0,
            "symbol": "I\/O,V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "17:30",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 102878,
                    "user_id": 861,
                    "type_id": 4,
                    "start_date": "2026-04-16 00:00:00",
                    "end_date": "2026-04-16 00:00:00",
                    "data": {
                        "tracking_times": [
                            {
                                "date": "2026-04-16",
                                "time": "17:30",
                                "reason_id": 25
                            }
                        ]
                    },
                    "created_at": "2026-04-22T04:18:38.000000Z"
                },
                {
                    "id": 102880,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-16 00:00:00",
                    "end_date": "2026-04-16 00:00:00",
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
                    "created_at": "2026-04-22T04:21:57.000000Z"
                }
            ],
            "log_work": {
                "id": 17238597,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-16",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-17",
            "time_in": "08:43",
            "time_out": "21:34",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "21:34",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 102881,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-17 00:00:00",
                    "end_date": "2026-04-17 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-04-17",
                                "time_end": "08:43",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-04-22T04:22:17.000000Z"
                }
            ],
            "log_work": {
                "id": 17238603,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-17",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-18",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-19",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-20",
            "time_in": "08:42",
            "time_out": "18:25",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:25",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 103639,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-04-20 00:00:00",
                    "end_date": "2026-04-20 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-04-20",
                                "time_end": "08:31",
                                "reason_id": 4,
                                "count_hour": 0.016666666666667496,
                                "date_start": "2026-04-20",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0021
                        }
                    },
                    "created_at": "2026-04-27T15:59:34.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17238611,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-20",
                "time_spent_hour": 8
            },
            "log_work_diff": 0.0167,
            "log_work_needed": 7.9833
        },
        {
            "date": "2026-04-21",
            "time_in": "08:51",
            "time_out": "19:38",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "19:38",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 103636,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-21 00:00:00",
                    "end_date": "2026-04-21 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-04-21",
                                "time_end": "08:51",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-04-27T15:59:31.000000Z"
                }
            ],
            "log_work": {
                "id": 17238619,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-21",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-22",
            "time_in": "08:46",
            "time_out": "22:22",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "22:22",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 103638,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-04-22 00:00:00",
                    "end_date": "2026-04-22 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-04-22",
                                "time_end": "08:46",
                                "reason_id": 4,
                                "count_hour": 0.2666666666666675,
                                "date_start": "2026-04-22",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0333
                        }
                    },
                    "created_at": "2026-04-27T15:59:33.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17238627,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-22",
                "time_spent_hour": 8
            },
            "log_work_diff": 0.2667,
            "log_work_needed": 7.7333
        },
        {
            "date": "2026-04-23",
            "time_in": "08:48",
            "time_out": "18:52",
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "18:52",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 103637,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-04-23 00:00:00",
                    "end_date": "2026-04-23 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-04-23",
                                "time_end": "08:48",
                                "reason_id": 4,
                                "count_hour": 0.3000000000000007,
                                "date_start": "2026-04-23",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 0.0375
                        }
                    },
                    "created_at": "2026-04-27T15:59:32.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": {
                "id": 17238635,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-23",
                "time_spent_hour": 8
            },
            "log_work_diff": 0.3,
            "log_work_needed": 7.7
        },
        {
            "date": "2026-04-24",
            "time_in": "08:52",
            "time_out": "21:49",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "21:49",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 103635,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-24 00:00:00",
                    "end_date": "2026-04-24 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-04-24",
                                "time_end": "08:52",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-04-27T15:59:30.000000Z"
                }
            ],
            "log_work": {
                "id": 17238643,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-24",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-25",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-26",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "N",
            "work_days": 0,
            "work_hours": 0,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-27",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "NB",
            "work_days": 1,
            "work_hours": 8,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-28",
            "time_in": "08:35",
            "time_out": "19:21",
            "time_off_type": 0,
            "symbol": "V",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "19:21",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 104423,
                    "user_id": 861,
                    "type_id": 2,
                    "start_date": "2026-04-28 00:00:00",
                    "end_date": "2026-04-28 00:00:00",
                    "data": {
                        "reason_id": 21,
                        "tracking_times": [
                            {
                                "date": "2026-04-28",
                                "time_end": "08:35",
                                "reason_id": 21,
                                "time_start": "08:30"
                            }
                        ]
                    },
                    "created_at": "2026-05-04T02:36:05.000000Z"
                }
            ],
            "log_work": {
                "id": 17238652,
                "user_id": 861,
                "time_spent": 28800,
                "date": "2026-04-28",
                "time_spent_hour": 8
            },
            "log_work_diff": 0,
            "log_work_needed": 8
        },
        {
            "date": "2026-04-29",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": "P",
            "location": "",
            "time_in_final": "08:30",
            "time_out_final": "17:30",
            "work": "1",
            "work_days": 1,
            "work_hours": 8,
            "work_start": "08:30",
            "work_end": "17:30",
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [
                {
                    "id": 104452,
                    "user_id": 861,
                    "type_id": 1,
                    "start_date": "2026-04-29 00:00:00",
                    "end_date": "2026-04-29 00:00:00",
                    "data": {
                        "reason_id": 4,
                        "tracking_times": [
                            {
                                "date_end": "2026-04-29",
                                "time_end": "17:30",
                                "reason_id": 4,
                                "count_hour": 8,
                                "date_start": "2026-04-29",
                                "time_start": "08:30"
                            }
                        ],
                        "annual_leave_used": {
                            "last_year": 0,
                            "this_year": 1
                        }
                    },
                    "created_at": "2026-05-04T02:46:56.000000Z",
                    "user": {
                        "id": 861,
                        "name": "\u0110\u1ed7 Huy V\u01b0\u1ee3ng",
                        "katakana_name": null,
                        "code": "KP.00442",
                        "email": "vuongdh@kaopiz.com",
                        "status": 1,
                        "timesheet_code": 73,
                        "jira_user_key": "JIRAUSER12511",
                        "department_id": 7,
                        "contract_department_id": 2,
                        "ksystem_roles": "LTV",
                        "application_form_config": {
                            "types": [
                                {
                                    "type_id": 1,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 2,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 3,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 4,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 5,
                                    "max_days_after": 6,
                                    "max_days_before": 0
                                },
                                {
                                    "type_id": 6,
                                    "max_days_after": 6,
                                    "max_days_before": 0,
                                    "max_application_form_in_month": 40
                                }
                            ]
                        },
                        "annual_leave_config": {
                            "allow_advance": 6
                        },
                        "email_verified_at": null,
                        "created_at": "2023-01-11T19:41:00.000000Z",
                        "updated_at": "2026-08-03T01:44:56.000000Z",
                        "deleted_at": null,
                        "deactive_at": null,
                        "working_start_date": "2022-05-30",
                        "official_start_date": "2022-07-30",
                        "working_end_date": null,
                        "work_time_id": null,
                        "user_working_time": null,
                        "work_time_contract_department": {
                            "work_time_id": 2,
                            "contract_department_id": 2,
                            "work_time": {
                                "id": 2,
                                "name": "Kaopiz Vi\u1ec7t Nam",
                                "work_start": "08:30",
                                "work_end": "17:30",
                                "lunch_start": "12:00",
                                "lunch_end": "13:00",
                                "dinner_start": "17:30",
                                "dinner_end": "18:00",
                                "working_hours_per_day": 8,
                                "working_hours_per_shift": 8,
                                "minutes_early_late_allowed": 90,
                                "timezone": "VN",
                                "created_at": "2024-08-06T04:18:55.000000Z",
                                "updated_at": "2024-08-06T04:18:55.000000Z"
                            }
                        }
                    }
                }
            ],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        },
        {
            "date": "2026-04-30",
            "time_in": null,
            "time_out": null,
            "time_off_type": 0,
            "symbol": null,
            "location": "",
            "time_in_final": null,
            "time_out_final": null,
            "work": "NL",
            "work_days": 1,
            "work_hours": 8,
            "work_start": null,
            "work_end": null,
            "minutes_late": 0,
            "minutes_early": 0,
            "approved_application_forms": [],
            "log_work": null,
            "log_work_diff": 0,
            "log_work_needed": 0
        }
    ],
    "leave": {
        "health_insurance_leave": 0,
        "marriage_leave": 0,
        "filial_leave": 0,
        "unpaid_leave": 0,
        "annual_leave": 2.4875,
        "unpaid_leave_without_application": 0,
        "total_unpaid": 0
    },
    "annual_leave_info": {
        "used": 2.4875,
        "used_this_year": 4.2586,
        "available_this_year": -0.2591,
        "remaining_last_year": 0
    },
    "overtime": {
        "actual": 0,
        "multiplied_by_rate": 0,
        "compensatory_leave": 0
    },
    "absence": {
        "absence_compensatory_leave": 0
    },
    "working_start_date": "2022-05-30",
    "working_end_date": null,
    "summary": {
        "minutes_late": 79,
        "minutes_early": 0,
        "numbers_late": 6,
        "numbers_early": 0,
        "fines": 0,
        "bonus": 0,
        "actual_working_day": 17.5125,
        "timekeeping_holidays": 2,
        "missing_work_days": 0,
        "numbers_log_work_diff": 4
    },
    "total": {
        "work_hour": 174.6834,
        "work_day": 22,
        "standard_workday": 22,
        "actual_work_days": 22,
        "log_work_hour": 140.5,
        "log_work_diff": 0.4001
    }
}
```

## From this system (kaopiz-ex). This system call the original system.

API: GET https://kaopiz-ex-api.vngou.online/timesheet/calendar?monthYear=04-2026

Payload:

Response:
```
{
    "success": true,
    "data": {
        "userId": 861,
        "userCode": "KP.00442",
        "userFullName": "Đỗ Huy Vượng",
        "userFullNameKatakana": "Đỗ Huy Vượng",
        "userEmail": "vuongdh@kaopiz.com",
        "departmentId": 7,
        "contractDepartmentId": 2,
        "seniorManagements": null,
        "workingTime": {
            "id": 2,
            "name": "Kaopiz Việt Nam",
            "workStart": "08:30",
            "workEnd": "17:30",
            "lunchStart": "12:00",
            "lunchEnd": "13:00",
            "dinnerStart": "17:30",
            "dinnerEnd": "18:00",
            "workingHoursPerDay": 8,
            "workingHoursPerShift": 8,
            "minutesEarlyLateAllowed": 90,
            "timezone": "VN",
            "createdAt": "2024-08-06T04:18:55.000Z",
            "updatedAt": "2024-08-06T04:18:55.000Z",
            "lunchBreakTime": 60,
            "dinnerBreakTime": 30,
            "dayOfWeek": 0,
            "timezoneValue": "Asia/Ho_Chi_Minh"
        },
        "timelines": [
            {
                "date": "2026-04-01T00:00:00.000Z",
                "timeIn": "08:50",
                "timeOut": "19:27",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:50",
                "timeOutFinal": "19:27",
                "work": "1",
                "workDays": 1,
                "workHours": 7.6667,
                "workStart": "08:50",
                "workEnd": "17:30",
                "minutesLate": 20,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17238512,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-01T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-02T00:00:00.000Z",
                "timeIn": "09:26",
                "timeOut": "18:37",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:37",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 100261,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-02T00:00:00.000Z",
                        "endDate": "2026-04-02T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-04-02",
                                    "timeStart": "08:30",
                                    "timeEnd": "09:26",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-04-05T15:42:34.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238519,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-02T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-03T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "17:30",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 100919,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-04-03T00:00:00.000Z",
                        "endDate": "2026-04-03T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-04-03",
                                    "dateEnd": "2026-04-03",
                                    "timeStart": "08:30",
                                    "timeEnd": "17:30",
                                    "countHour": 8,
                                    "reasonId": 4
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 1
                            }
                        },
                        "createdAt": "2026-04-09T07:13:37.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-04T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-05T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-06T00:00:00.000Z",
                "timeIn": "08:44",
                "timeOut": "18:41",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:44",
                "timeOutFinal": "18:41",
                "work": "1",
                "workDays": 1,
                "workHours": 7.7667,
                "workStart": "08:44",
                "workEnd": "17:30",
                "minutesLate": 14,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17238534,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-06T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-07T00:00:00.000Z",
                "timeIn": "08:50",
                "timeOut": "18:35",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:35",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 101059,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-07T00:00:00.000Z",
                        "endDate": "2026-04-07T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-04-07",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:50",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-04-10T02:48:58.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238542,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-07T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-08T00:00:00.000Z",
                "timeIn": "08:44",
                "timeOut": "18:22",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:22",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 101060,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-08T00:00:00.000Z",
                        "endDate": "2026-04-08T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-04-08",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:44",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-04-10T02:48:59.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238550,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-08T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-09T00:00:00.000Z",
                "timeIn": "08:42",
                "timeOut": "19:27",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:42",
                "timeOutFinal": "19:27",
                "work": "1",
                "workDays": 1,
                "workHours": 7.8,
                "workStart": "08:42",
                "workEnd": "17:30",
                "minutesLate": 12,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17238558,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-09T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-10T00:00:00.000Z",
                "timeIn": "08:33",
                "timeOut": "21:24",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:33",
                "timeOutFinal": "21:24",
                "work": "1",
                "workDays": 1,
                "workHours": 7.95,
                "workStart": "08:33",
                "workEnd": "17:30",
                "minutesLate": 3,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17238565,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-10T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-11T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-12T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-13T00:00:00.000Z",
                "timeIn": "08:38",
                "timeOut": "17:40",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:38",
                "timeOutFinal": "17:40",
                "work": "1",
                "workDays": 1,
                "workHours": 7.8667,
                "workStart": "08:38",
                "workEnd": "17:30",
                "minutesLate": 8,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17238573,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-13T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-14T00:00:00.000Z",
                "timeIn": "08:52",
                "timeOut": "22:29",
                "symbol": null,
                "location": "",
                "timeInFinal": "08:52",
                "timeOutFinal": "22:29",
                "work": "1",
                "workDays": 1,
                "workHours": 7.6333,
                "workStart": "08:52",
                "workEnd": "17:30",
                "minutesLate": 22,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": {
                    "id": 17238581,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-14T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-15T00:00:00.000Z",
                "timeIn": "11:49",
                "timeOut": "19:38",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "19:38",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 102855,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-04-15T00:00:00.000Z",
                        "endDate": "2026-04-15T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-04-15",
                                    "dateEnd": "2026-04-15",
                                    "timeStart": "08:30",
                                    "timeEnd": "11:49",
                                    "countHour": 3.3166666666666664,
                                    "reasonId": 4
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.4146
                            }
                        },
                        "createdAt": "2026-04-22T02:28:12.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17238589,
                    "userId": 861,
                    "timeSpent": 16200,
                    "date": "2026-04-15T00:00:00.000Z",
                    "timeSpentHour": 4.5
                },
                "logWorkDiff": -0.1833,
                "logWorkNeeded": 4.6833
            },
            {
                "date": "2026-04-16T00:00:00.000Z",
                "timeIn": "08:45",
                "timeOut": "13:50",
                "symbol": "I/O,V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "17:30",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 102878,
                        "userId": 861,
                        "typeId": 4,
                        "startDate": "2026-04-16T00:00:00.000Z",
                        "endDate": "2026-04-16T00:00:00.000Z",
                        "data": {
                            "trackingTimes": [
                                {
                                    "date": "2026-04-16",
                                    "reasonId": 25
                                }
                            ]
                        },
                        "createdAt": "2026-04-22T04:18:38.000Z"
                    },
                    {
                        "id": 102880,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-16T00:00:00.000Z",
                        "endDate": "2026-04-16T00:00:00.000Z",
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
                        "createdAt": "2026-04-22T04:21:57.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238597,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-16T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-17T00:00:00.000Z",
                "timeIn": "08:43",
                "timeOut": "21:34",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "21:34",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 102881,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-17T00:00:00.000Z",
                        "endDate": "2026-04-17T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-04-17",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:43",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-04-22T04:22:17.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238603,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-17T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-18T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-19T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-20T00:00:00.000Z",
                "timeIn": "08:42",
                "timeOut": "18:25",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:25",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 103639,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-04-20T00:00:00.000Z",
                        "endDate": "2026-04-20T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-04-20",
                                    "dateEnd": "2026-04-20",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:31",
                                    "countHour": 0.016666666666667496,
                                    "reasonId": 4
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0021
                            }
                        },
                        "createdAt": "2026-04-27T15:59:34.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17238611,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-20T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0.0167,
                "logWorkNeeded": 7.9833
            },
            {
                "date": "2026-04-21T00:00:00.000Z",
                "timeIn": "08:51",
                "timeOut": "19:38",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "19:38",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 103636,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-21T00:00:00.000Z",
                        "endDate": "2026-04-21T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-04-21",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:51",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-04-27T15:59:31.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238619,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-21T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-22T00:00:00.000Z",
                "timeIn": "08:46",
                "timeOut": "22:22",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "22:22",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 103638,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-04-22T00:00:00.000Z",
                        "endDate": "2026-04-22T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-04-22",
                                    "dateEnd": "2026-04-22",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:46",
                                    "countHour": 0.2666666666666675,
                                    "reasonId": 4
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0333
                            }
                        },
                        "createdAt": "2026-04-27T15:59:33.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17238627,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-22T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0.2667,
                "logWorkNeeded": 7.7333
            },
            {
                "date": "2026-04-23T00:00:00.000Z",
                "timeIn": "08:48",
                "timeOut": "18:52",
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "18:52",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 103637,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-04-23T00:00:00.000Z",
                        "endDate": "2026-04-23T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-04-23",
                                    "dateEnd": "2026-04-23",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:48",
                                    "countHour": 0.3000000000000007,
                                    "reasonId": 4
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 0.0375
                            }
                        },
                        "createdAt": "2026-04-27T15:59:32.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": {
                    "id": 17238635,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-23T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0.3,
                "logWorkNeeded": 7.7
            },
            {
                "date": "2026-04-24T00:00:00.000Z",
                "timeIn": "08:52",
                "timeOut": "21:49",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "21:49",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 103635,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-24T00:00:00.000Z",
                        "endDate": "2026-04-24T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-04-24",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:52",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-04-27T15:59:30.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238643,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-24T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-25T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-26T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "N",
                "workDays": 0,
                "workHours": 0,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-27T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "NB",
                "workDays": 1,
                "workHours": 8,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-28T00:00:00.000Z",
                "timeIn": "08:35",
                "timeOut": "19:21",
                "symbol": "V",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "19:21",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 104423,
                        "userId": 861,
                        "typeId": 2,
                        "startDate": "2026-04-28T00:00:00.000Z",
                        "endDate": "2026-04-28T00:00:00.000Z",
                        "data": {
                            "reasonId": 21,
                            "trackingTimes": [
                                {
                                    "date": "2026-04-28",
                                    "timeStart": "08:30",
                                    "timeEnd": "08:35",
                                    "reasonId": 21
                                }
                            ]
                        },
                        "createdAt": "2026-05-04T02:36:05.000Z"
                    }
                ],
                "logWork": {
                    "id": 17238652,
                    "userId": 861,
                    "timeSpent": 28800,
                    "date": "2026-04-28T00:00:00.000Z",
                    "timeSpentHour": 8
                },
                "logWorkDiff": 0,
                "logWorkNeeded": 8
            },
            {
                "date": "2026-04-29T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": "P",
                "location": "",
                "timeInFinal": "08:30",
                "timeOutFinal": "17:30",
                "work": "1",
                "workDays": 1,
                "workHours": 8,
                "workStart": "08:30",
                "workEnd": "17:30",
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [
                    {
                        "id": 104452,
                        "userId": 861,
                        "typeId": 1,
                        "startDate": "2026-04-29T00:00:00.000Z",
                        "endDate": "2026-04-29T00:00:00.000Z",
                        "data": {
                            "reasonId": 4,
                            "trackingTimes": [
                                {
                                    "dateStart": "2026-04-29",
                                    "dateEnd": "2026-04-29",
                                    "timeStart": "08:30",
                                    "timeEnd": "17:30",
                                    "countHour": 8,
                                    "reasonId": 4
                                }
                            ],
                            "annualLeaveUsed": {
                                "last_year": 0,
                                "this_year": 1
                            }
                        },
                        "createdAt": "2026-05-04T02:46:56.000Z",
                        "user": {
                            "id": 861,
                            "name": "Đỗ Huy Vượng",
                            "katakana_name": null,
                            "code": "KP.00442",
                            "email": "vuongdh@kaopiz.com",
                            "status": 1,
                            "timesheet_code": 73,
                            "jira_user_key": "JIRAUSER12511",
                            "department_id": 7,
                            "contract_department_id": 2,
                            "ksystem_roles": "LTV",
                            "application_form_config": {
                                "types": [
                                    {
                                        "type_id": 1,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 2,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 3,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 4,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 5,
                                        "max_days_after": 6,
                                        "max_days_before": 0
                                    },
                                    {
                                        "type_id": 6,
                                        "max_days_after": 6,
                                        "max_days_before": 0,
                                        "max_application_form_in_month": 40
                                    }
                                ]
                            },
                            "annual_leave_config": {
                                "allow_advance": 6
                            },
                            "email_verified_at": null,
                            "created_at": "2023-01-11T19:41:00.000000Z",
                            "updated_at": "2026-08-03T01:44:56.000000Z",
                            "deleted_at": null,
                            "deactive_at": null,
                            "working_start_date": "2022-05-30",
                            "official_start_date": "2022-07-30",
                            "working_end_date": null,
                            "work_time_id": null,
                            "user_working_time": null,
                            "work_time_contract_department": {
                                "work_time_id": 2,
                                "contract_department_id": 2,
                                "work_time": {
                                    "id": 2,
                                    "name": "Kaopiz Việt Nam",
                                    "work_start": "08:30",
                                    "work_end": "17:30",
                                    "lunch_start": "12:00",
                                    "lunch_end": "13:00",
                                    "dinner_start": "17:30",
                                    "dinner_end": "18:00",
                                    "working_hours_per_day": 8,
                                    "working_hours_per_shift": 8,
                                    "minutes_early_late_allowed": 90,
                                    "timezone": "VN",
                                    "created_at": "2024-08-06T04:18:55.000000Z",
                                    "updated_at": "2024-08-06T04:18:55.000000Z"
                                }
                            }
                        }
                    }
                ],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            },
            {
                "date": "2026-04-30T00:00:00.000Z",
                "timeIn": null,
                "timeOut": null,
                "symbol": null,
                "location": "",
                "timeInFinal": null,
                "timeOutFinal": null,
                "work": "NL",
                "workDays": 1,
                "workHours": 8,
                "workStart": null,
                "workEnd": null,
                "minutesLate": 0,
                "minutesEarly": 0,
                "approvedApplicationForms": [],
                "logWork": null,
                "logWorkDiff": 0,
                "logWorkNeeded": 0
            }
        ],
        "leave": {
            "healthInsuranceLeave": 0,
            "marriageLeave": 0,
            "filialLeave": 0,
            "unpaidLeave": 0,
            "annualLeave": 2.4875,
            "unpaidLeaveWithoutApplication": 0,
            "totalUnpaid": 0
        },
        "annualLeaveInfo": {
            "used": 2.4875,
            "usedThisYear": 4.2586,
            "availableThisYear": -0.2591,
            "remainingLastYear": 0
        },
        "overtime": {
            "actual": 0,
            "multipliedByRate": 0,
            "compensatoryLeave": 0
        },
        "absence": {
            "absenceCompensatoryLeave": 0
        },
        "workingStartDate": "2022-05-30T00:00:00.000Z",
        "workingEndDate": null,
        "summary": {
            "minutesLate": 79,
            "minutesEarly": 0,
            "numbersLate": 6,
            "numbersEarly": 0,
            "fines": 0,
            "bonus": 0,
            "actualWorkingDay": 17.5125,
            "timekeepingHolidays": 2,
            "numbersLogWorkDiff": 4
        },
        "total": {
            "workHour": 174.6834,
            "workDay": 22,
            "standardWorkday": 22,
            "logWorkHour": 140.5,
            "logWorkDiff": 0.4001
        }
    }
}
```
