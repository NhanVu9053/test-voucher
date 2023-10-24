export enum DiscountType {
    DiscountByPercent = '1', // Giảm theo phần trăm đơn hàng
    DiscountByMiniOrder = '2', // Giảm theo giá trị thấp nhất ( ví dụ giảm 20k cho đơn tối thiểu 100k)
    DiscountByFreeShip = '3', // Giảm giá ship
    DiscountByFreeShipPercent = '4', // Giảm giá ship phần trăm
  }