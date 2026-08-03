Description: API get all reason for leave application.

API: GET https://api.hrm.kaopiz.com/api/master/all-reasons?type_id_equal=1&is_use_equal=1

Payload:

Response:
```
{
    "items": [
        {
            "id": 1,
            "name": "Nghỉ ốm",
            "description": "Tối đa: 30 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 1,
                "is_required_attachments": 1
            }
        },
        {
            "id": 2,
            "name": "Nghỉ thai sản",
            "description": "Tối đa: 184 Ngày \/ Năm",
            "data": {
                "type_leave": 5,
                "is_calculate_salary": 0,
                "is_required_attachments": 0
            }
        },
        {
            "id": 3,
            "name": "Nghỉ không lương",
            "description": "Tối đa: 30 Ngày \/ Năm",
            "data": {
                "type_leave": 4,
                "is_calculate_salary": 0
            }
        },
        {
            "id": 4,
            "name": "Nghỉ phép năm",
            "description": null,
            "data": {
                "type_leave": 1,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 5,
            "name": "Nghỉ con ốm",
            "description": "Tối đa: 20 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 0,
                "is_required_attachments": 1
            }
        },
        {
            "id": 6,
            "name": "Nghỉ dưỡng sức sau ốm đau",
            "description": "Tối đa: 10 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 0,
                "is_required_attachments": 1
            }
        },
        {
            "id": 7,
            "name": "Nghỉ dưỡng sức sau thai sản",
            "description": "Tối đa: 7 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 0,
                "is_required_attachments": 1
            }
        },
        {
            "id": 8,
            "name": "Nghỉ dưỡng sức sau điều trị thương tật, tai nạn",
            "description": "Tối đa: 7 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 0,
                "is_required_attachments": 1
            }
        },
        {
            "id": 9,
            "name": "Nghỉ tai nạn",
            "description": "Tối đa: 30 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 1,
                "is_required_attachments": 1
            }
        },
        {
            "id": 10,
            "name": "Nghỉ hiếu hỷ",
            "description": "Tối đa: 3 Ngày \/ Năm",
            "data": {
                "type_leave": 6,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 11,
            "name": "Nghỉ chăm vợ đẻ",
            "description": "Tối đa: 14 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 1,
                "is_required_attachments": 1
            }
        },
        {
            "id": 12,
            "name": "Nghỉ kết hôn",
            "description": "Tối đa: 3 Ngày \/ Năm",
            "data": {
                "type_leave": 3,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 13,
            "name": "Nghỉ khám thai",
            "description": "Tối đa: 5 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 1,
                "is_required_attachments": 1
            }
        },
        {
            "id": 14,
            "name": "Nghỉ con kết hôn",
            "description": "Tối đa: 1 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 1
            }
        },
        {
            "id": 15,
            "name": "Nghỉ sảy thai",
            "description": "Tối đa: 50 Ngày \/ Năm",
            "data": {
                "type_leave": 2,
                "is_calculate_salary": 1
            }
        }
    ]
}
```
