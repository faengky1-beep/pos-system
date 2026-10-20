# POS Web Application

ລະບົບການຂາຍສິນຄ້າແບບ POS (Point of Sale) ເວັບໄຊທ໌ທີ່ສາມາດໃຊ້ງານອອນໄລນ໌ໄດ້.

## ວິທີຕິດຕັ້ງ ແລະ ໃຊ້ງານ

### ວິທີໃຊ້ງານທີ່ງ່າຍທີ່ສຸດ:

1. **ຕິດຕັ້ງ Live Server** (ສຳລັບ VS Code):
   - ຕິດຕັ້ງ extension "Live Server" ໃນ VS Code
   - ຄລິກຂວາເມື່ອຟາຍ `index.html` ແລ້ວເລືອກ "Open with Live Server"

2. **ຫຼື ໃຊ້ Python** (ຖ້າມີ):
   ```bash
   python -m http.server 8000
   ```
   ແລ້ວເປີດ browser: `http://localhost:8000`

3. **ຫຼື ໃຊ້ Node.js** (ຖ້າມິ):
   ```bash
   npx serve .
   ```

## ລະບົບທີ່ມີ

### 1. ໜ້າຮ້ານ (Customer Facing)
- **ໜ້າຫຼັກ**: ສະແດງສິນຄ້າທັງໝົດໃນຮູບແບບ Grid
- **ລາຍລະອຽດສິນຄ້າ**: ກົດເພື່ອເບິ່ງຮູບພາບ, ຊື່, ລາຄາ, ສະຕັອກ
- **ກະຕ່າສິນຄ້າ**: ເພີ່ມ, ຫຼຸດ, ລົບສິນຄ້າ, ຄິດໄລ່ຍອດອັດຕະໂນມັດ
- **Checkout**: ຟອມຂໍ້ມູນລູກຄ້າ ພ້ອມ GPS Location ແລະ OpenStreetMap
- **ການຈ່າຍເງິນ**: 
  - COD (ເງິນສົດປາຍທາງ)
  - QR Code ພ້ອມອັບໂຫຼດສະລິບ

### 2. ໜ້າ Admin (Backend)
- **Login**: `admin` / `admin`
- **ຈັດການອໍເດີ້**: ດູລາຍການ, ປ່ຽນສະຖານະ
- **ຈັດການສິນຄ້າ**: ເພີ່ມ, ແກ້ໄຂ, ລົບ, ອັບໂຫຼດຮູບພາບ

## ສະຖານະອໍເດີ້
- `pending` - ລຳຖ້າ
- `preparing` - ກຳລັງກຽມ
- `shipping` - ກຳລັງສົ່ງ
- `delivered` - ຈັດສົ່ງສຳເລັດ

## ຂໍ້ມູນທີ່ຈັດເກັບ
ຂໍ້ມູນທັງໝົດຖືກເກັບໃນ **LocalStorage** ຂອງ Browser:
- `pos_products` - ລາຍການສິນຄ້າ
- `pos_orders` - ລາຍການອໍເດີ້
- `pos_cart` - ກະຕ່າສິນຄ້າຊົ່ວຄາວ
- `pos_admin_logged_in` - ສະຖານະເຂົ້າລະບົບ Admin

## ການລົບຂໍ້ມູນທັງໝົດ
ຖ້າຕ້ອງການລົບຂໍ້ມູນທັງໝົດ, ໃຊ້ Console ຂອງ Browser:
```javascript
localStorage.clear();
location.reload();
```

## ຮູບແບບການອອກແບບ
- ພື້ນຫຼັກ: ສີດໍ (#1a1a2e)
- ແຖບ: ສີສົ້ມ (#2d2d44)
- ປຸ່ມ: ສີແດງ (#e74c3c), ສີຟ້າ (#3498db), ສີເຫຼືອງ (#f1c40f)
- ຟອນ: Phetsarath OT, ຂະໜາດ 18px, Bold
