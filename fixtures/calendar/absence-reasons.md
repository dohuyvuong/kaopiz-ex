Description: API get all reason for absence application.

API: GET https://api.hrm.kaopiz.com/api/master/all-reasons?type_id_equal=2&is_use_equal=1

Payload:

Response:
```
{
    "items": [
        {
            "id": 17,
            "name": "Gặp Khách Hàng",
            "description": "Tối đa: 5 Lần \/ Tuần",
            "data": {
                "need_log_work": 1,
                "max_times_in_week": 5,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 18,
            "name": "Làm việc ở ngoài",
            "description": "Tối đa: 5 Lần \/ Tuần",
            "data": {
                "need_log_work": 1,
                "max_times_in_week": 5,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 19,
            "name": "Làm việc ở nhà",
            "description": "Tối đa: 7 Lần \/ Tuần",
            "data": {
                "need_log_work": 1,
                "max_times_in_week": 7,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 20,
            "name": "OT hôm trước sau 21:00 (Cho phép đi muộn 30 phút)",
            "description": "Tối đa: 5 Lần \/ Tuần",
            "data": {
                "need_log_work": 0,
                "max_minutes_in_day": 30,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 21,
            "name": "Thay đổi thời gian làm việc (Vẫn đảm bảo đủ 8 tiếng). Lưu ý: Mỗi lần không muộn quá 1h.",
            "description": "Tối đa: 2 Lần \/ Tuần",
            "data": {
                "need_log_work": 1,
                "max_times_in_week": 2,
                "max_minutes_in_day": 60,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 22,
            "name": "Nghỉ bù",
            "description": "Đơn vị tính theo giờ",
            "data": {
                "need_log_work": 0,
                "is_calculate_salary": 1
            }
        }
    ]
}
```
