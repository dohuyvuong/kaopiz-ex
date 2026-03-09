/**
 * Entity - một cấu hình người duyệt
 * Khớp với API và DB
 */
export interface ApproverPreference {
  typeId: number;
  order: number;
  approverUserId: number;
}

/** Collection - danh sách preferences */
export type ApproverPreferences = ApproverPreference[];

/** Legacy format từ localStorage: { [typeId]: { [order]: approverUserId } } */
export type ApproverPreferencesLegacyMap = Record<
  number,
  Record<number, number>
>;

export const ApproverPreferencesHelper = {
  /** Lấy approverUserId cho (typeId, order), trả về null nếu không có */
  get(
    prefs: ApproverPreferences,
    typeId: number,
    order: number,
  ): number | null {
    const found = prefs.find(
      (p) => p.typeId === typeId && p.order === order,
    );
    return found?.approverUserId ?? null;
  },

  /** Trả về Record<order, approverUserId> cho typeId - dùng cho UI */
  getByTypeId(
    prefs: ApproverPreferences,
    typeId: number,
  ): Record<number, number | null> {
    const result: Record<number, number | null> = {};
    prefs
      .filter((p) => p.typeId === typeId)
      .forEach((p) => {
        result[p.order] = p.approverUserId;
      });
    return result;
  },

  /** Thêm/sửa/xóa một preference (immutable) */
  set(
    prefs: ApproverPreferences,
    typeId: number,
    order: number,
    approverUserId: number | null,
  ): ApproverPreferences {
    const filtered = prefs.filter(
      (p) => !(p.typeId === typeId && p.order === order),
    );
    if (approverUserId !== null) {
      return [...filtered, { typeId, order, approverUserId }];
    }
    return filtered;
  },

  /** Chuyển từ legacy map (localStorage) sang ApproverPreferences */
  fromLegacyMap(
    map: ApproverPreferencesLegacyMap | Record<string, Record<string, number>>,
  ): ApproverPreferences {
    const result: ApproverPreferences = [];
    for (const [typeIdStr, orders] of Object.entries(map)) {
      const typeId = Number(typeIdStr);
      if (Number.isNaN(typeId) || !orders || typeof orders !== 'object')
        continue;
      for (const [orderStr, approverUserId] of Object.entries(orders)) {
        const order = Number(orderStr);
        const uid =
          typeof approverUserId === 'number'
            ? approverUserId
            : Number(approverUserId);
        if (!Number.isNaN(order) && uid && !Number.isNaN(uid)) {
          result.push({ typeId, order, approverUserId: uid });
        }
      }
    }
    return result;
  },

  /** Chuyển sang legacy map (để tương thích nếu cần) */
  toLegacyMap(prefs: ApproverPreferences): ApproverPreferencesLegacyMap {
    const result: ApproverPreferencesLegacyMap = {};
    for (const p of prefs) {
      if (!result[p.typeId]) result[p.typeId] = {};
      result[p.typeId][p.order] = p.approverUserId;
    }
    return result;
  },
};
