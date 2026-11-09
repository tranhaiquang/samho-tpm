-- pm_tasks import from PM_TPM workbooks (2026-11-09)
-- Sources: PM_TPM Non Pad GeL Press MC.xlsx (PM_Task_Detail + PM_Generation)
--          PM_TPM Stitiching Machine.xlsx (6 sheets)
-- Rows: 60 (SDL PRESS OUTSOLE + NON PAD GEL PRESS + 6 stitching equipments)
-- Run in Supabase SQL Editor. Re-running is safe (delete-then-insert per key).

BEGIN;

DELETE FROM pm_tasks
WHERE (equipment, name_en, task_no) IN (VALUES
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0001'),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0002'),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0003'),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0004'),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0005'),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0001'),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0002'),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0003'),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0004'),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0005'),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0001'),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0002'),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0003'),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0004'),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0005'),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0001'),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0002'),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0003'),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0004'),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0005'),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0001'),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0004'),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0006'),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0007'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0001'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0002'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0003'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0004'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0005'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0006'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0007'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0008'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0009'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0010'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0011'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0012'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0013'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0014'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0015'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0016'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0017'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0018'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0019'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0020'),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0021'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0001'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0002'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0003'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0004'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0005'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0006'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0007'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0008'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0009'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0010'),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0001'),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0002'),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0003'),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0004'),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0005')
);

INSERT INTO pm_tasks (equipment, name_en, task_no, task_name, item_group, item_task, frequency, task_detail) VALUES
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0001', 'Kiểm tra, bảo dưỡng dây điện', 'PHẦN ĐIỆN', '', 'Monthly', ''),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0002', 'Kiểm tra, bảo dưỡng kim và ổ kim', 'PHẦN CƠ', '', 'Monthly', ''),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0003', 'Kiểm tra, bảo dưỡng lao dầu và hốt chỉ', 'PHẦN CƠ', '', 'Quaterly', ''),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0004', 'Kiểm tra, bảo dưỡng bánh xe và bàn đạp', 'PHẦN CƠ', '', 'Monthly', ''),
  ('1 Needle Flate Machine', '1 Needle Flate Machine', 'STT-PM0005', 'Kiểm tra, bảo dưỡng dây curoa', 'PHẦN CƠ', '', 'Monthly', ''),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0001', 'Kiểm tra, bảo dưỡng dây điện', 'PHẦN ĐIỆN', '', 'Tháng', ''),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0002', 'Kiểm tra, bảo dưỡng kim và ổ kim', 'PHẦN CƠ', '', 'Tháng', ''),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0003', 'Kiểm tra, bảo dưỡng lao dầu và hốt chỉ', 'PHẦN CƠ', '', 'Quaterly', ''),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0004', 'Kiểm tra, bảo dưỡng bánh xe và bàn đạp', 'PHẦN CƠ', '', 'Tháng', ''),
  ('1 Needle Post Machine', '1 Needle Post Machine', 'STT-PM0005', 'Kiểm tra, bảo dưỡng dây curoa', 'PHẦN CƠ', '', 'Tháng', ''),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0001', 'Kiểm tra, bảo dưỡng dây điện', 'PHẦN ĐIỆN', '', 'Tháng', ''),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0002', 'Kiểm tra, bảo dưỡng kim và ổ kim', 'PHẦN CƠ', '', 'Tháng', ''),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0003', 'Kiểm tra, bảo dưỡng lao dầu và hốt chỉ', 'PHẦN CƠ', '', 'Quaterly', ''),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0004', 'Kiểm tra, bảo dưỡng bánh xe và bàn đạp', 'PHẦN CƠ', '', 'Tháng', ''),
  ('1 Post Roller Machine', '1 Post Roller Machine', 'STT-PM0005', 'Kiểm tra, bảo dưỡng dây curoa', 'PHẦN CƠ', '', 'Tháng', ''),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0001', 'Kiểm tra, bảo dưỡng dây điện', 'PHẦN ĐIỆN', '', 'Tháng', ''),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0002', 'Kiểm tra, bảo dưỡng kim và ổ kim', 'PHẦN CƠ', '', 'Tháng', ''),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0003', 'Kiểm tra, bảo dưỡng lao dầu và hốt chỉ', 'PHẦN CƠ', '', 'Quaterly', ''),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0004', 'Kiểm tra, bảo dưỡng bánh xe và bàn đạp', 'PHẦN CƠ', '', 'Tháng', ''),
  ('2 Needle PostMachine', '2 Needle PostMachine', 'STT-PM0005', 'Kiểm tra, bảo dưỡng dây curoa', 'PHẦN CƠ', '', 'Tháng', ''),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0001', 'Kiểm tra, bảo dưỡng dây điện', 'PHẦN ĐIỆN', '', 'Tháng', ''),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0004', 'Kiểm tra, bảo dưỡng bánh xe và bàn đạp', 'PHẦN CƠ', '', 'Tháng', ''),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0006', 'Kiểm tra bảo dưỡng châm dầu và vệ sinh bụi máy may vi tính', 'PHẦN CƠ', '', '2 Tháng', ''),
  ('Computer Stitching Machine', 'Computer Stitching Machine', 'STT-PM0007', 'Kiểm tra thùng máy (CPU) máy may vi tính', 'PHẦN CƠ', '', 'Tháng', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0001', 'Chụp cao su không rách, không mất hình dạng, đảm bảo che phủ tốt', 'PHẦN CƠ', 'Chụp cao su (Shoes cover)', 'TUẦN', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0002', 'Túi không rách, không thủng, lớp vải còn vững chắc, thay mới nếu bị hư (> 1 tháng)', 'PHẦN CƠ', 'Túi vải (4 lớp)', 'TUẦN', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0003', 'Hệ thống điện ổn định, tiếp điểm không bị ăn mòn, dây dẫn không hở/rụng', 'PHẦN CƠ', 'Kiểm tra hệ thống điện điều khiển', 'TUẦN', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0004', 'Chụp cao su không rách, không mất hình dạng, đảm bảo che phủ tốt', 'PHẦN CƠ', 'Chụp cao su (Shoes cover)', 'THÁNG', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0005', 'Túi không rách, không thủng, lớp vải còn vững chắc, thay mới nếu bị hư (> 1 tháng)', 'PHẦN CƠ', 'Túi vải (4 lớp)', 'THÁNG', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0006', 'Hệ thống điện ổn định, tiếp điểm không bị ăn mòn, dây dẫn không hở/rụng', 'PHẦN CƠ', 'Kiểm tra hệ thống điện điều khiển', 'THÁNG', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0007', 'Truyền động bôi trơn đủ, pittông di chuyển trơn tru, không có tiếng kêu', 'PHẦN  CƠ', 'Bôi trơn cụm truyền động & pít-tông khí nén', 'THÁNG', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0008', 'Đồng hồ hiển thị đúng, van xả hoạt động tốt, lưu lượng/áp suất trong ngưỡng', 'PHẦN  CƠ', 'Kiểm tra đồng hồ áp suất & van xả', 'THÁNG', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0009', 'Tube/khuôn không biến dạng, không mất độ đàn hồi, thay mới nếu cần', 'PHẦN  CƠ', 'Tube / Khuôn mềm', 'QUÝ', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0010', 'Tương tự Tube chính, tình trạng tốt, không rạn nứt hoặc chai cứng', 'PHẦN  CƠ', 'Kid Tube / Khuôn mềm trẻ em', 'QUÝ', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0011', 'Độ đàn hồi còn ≥ chuẩn, không khô cứng, thay mới nếu bị hư', 'PHẦN  CƠ', 'Elastic Ball / Hạt silicon', 'QUÝ', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0012', 'Nắp đóng kín, không hở mép, bản lề & khóa hoạt động tốt', 'PHẦN CƠ', 'Nắp trên (Pressure Door)', 'QUÝ', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0013', 'Gối đỡ không biến dạng, không mòn quá mức, thay khi > chỉ số mòn định kỳ', 'PHẦN CƠ', 'Gối đỡ / Toe Pad (các loại)', 'QUÝ', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0014', 'Đệm tình trạng tốt, không rách, độ dày đủ, thay khi có dấu hiệu hư', 'PHẦN CƠ', 'Đệm khuôn mềm (Tube Cover)', 'QUÝ', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0015', 'Dầu/gel ép trong bình chứa đạt độ trong, không lẫn tạp chất, thay định kỳ', 'PHẦN CƠ', 'Dầu ép (Gel Fluid)', 'HÀNG NĂM', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0016', 'Cảm biến đo đúng ±5% so với chuẩn, phản hồi nhanh, không bị chập/chết', 'PHẦN CƠ', 'Cảm biến áp lực (Pressure Sensor)', 'HÀNG NĂM', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0017', 'Hoạt động chính xác, không sai lệch, không bị bẩn hoặc che khuất', 'PHẦN  CƠ', 'Cảm biến khoảng cách (Distance Sensor)', 'HÀNG NĂM', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0018', 'Tất cả nút khẩn cấp & nút start thay mới định kỳ/kiểm tra độ nhạy', 'PHẦN  CƠ', 'Nút khẩn cấp / Nút Start', 'HÀNG NĂM', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0019', 'Ring/ốc không rỉ sét, không lỏng, siết chặt đúng mô-men, không biến dạng', 'PHẦN  CƠ', 'Gọng sắt (Ring) & ốc cố định', 'HÀNG NĂM', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0020', 'Hệ thống khí nén không rò, ống dẫn và van hoạt động tốt, lọc khí sạch', 'PHẦN  CƠ', 'Kiểm tra tổng thể hệ thống khí nén', 'HÀNG NĂM', ''),
  ('NON PAD GEL PRESS', 'NON PAD GEL PRESS', 'PM0021', 'Máy hoạt động theo thông số chuẩn: áp suất ép, tốc độ, chất lượng sản phẩm đạt yêu cầu', 'PHẦN ĐIỆN', 'Kiểm định hiệu suất máy', 'HÀNG NĂM', ''),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0001', 'KIỂM TRA, BẢO DƯỠNG TẤM VÁN THỚT DƯỚI', 'PHẦN CƠ', 'TÂM VÁN THỚT DƯỚI', 'THÁNG', '1. Bật công tắc nguồn
2. Nhấn nút khẩn cấp cho tấm thớt dưới chạy ra
3. Dùng súng hơi và lục giác 10 tháo ốc 12 (6 cái) ra
4. Dùng lục giác đẩy tấm thớt trên ra
5. Kiểm tra tấm ván nếu hư hoặc bể thì thay mới
6. Vệ sinh, Sịt chống sét vị trí ren và ốc  
7.Lắp vào và kiểm tra'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0002', 'KIỂM TRA, BẢO DƯỠNG TẤM VÁN THỚT TRÊN', 'PHẦN CƠ', 'TÂM VÁN THỚT TRÊN', 'THÁNG', '1. Dùng lục giác 5 tháo ốc lục giác 6 (4 cái ra)
2. Tháo tấm inox ra
3. Dùng lúc giác 10 tháo ốc 12 phía sau tấm thớt trên 
4. Kích tay xy lanh đầu để bật thớt trên ra
5. Dùng lục giác 8 tháo ốc 10   để tháo 2 pass bắt khuôn thớt trên 
6. Dùng tay kích xy lanh đầu để rút thớt trên lên
7. Dùng tấm gỗ để trên thớt dưới,  sau đó nâng pittong lên chạm thớt trên để giữ tấm thớt trên 
8. Dùng lục giác 10 thá o ốc 12 để tháo tấm thớt trên ra
9. Hạ máy xuống ở khoảng cách vừa đủ để lấy  tấm ván cũ ra
10. Kiểm tra nếu hư hỏng thì thay mới
11. Thay mới 
12. Lắp vào và kiểm tra'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0003', 'KIỂM TRA TẤM KÍNH BẢO VỆ', 'PHẦN CƠ', 'TẤM KÍNH BẢO VỆ', 'THÁNG', '1.Tắt công tắc nguồn
2. Nhấn nút chốt cửa phía trước để mở ra 
3. Kiểm tra tình trạng cửa kính, nếu hư hoặc bể thì thay mới
4. Trường hợp hư thì
4.1 Dùng súng hơi và lục giác 5 tháo 4 ốc cố định tấm kính bảo vệ
4.2 Kéo tấm kính từ dưới lên (tháo ra)
4.3 Thay tấm kính mới, khoan 4 lỗ, ta ro ren 
4.4 Lắp vào và kiểm tra'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0004', 'KIỂM TRA, VỆ SINH VÀ BẢO DƯỠNG', 'PHẦN  CƠ', 'XY LANH ÉP CHÍNH', 'THÁNG', '1. Nâng máy bằng tay hoặc bật công tắc nguồn
2. Lấy Cây hoặc thanh gỗ lót đế thớt dưới 
3. Dúng khóa 24 để khóa ốc 16 (6 con)
4. Mở công tắc nguồn bấm máy hạ xuống, Pittong xuống, cấy chống giữ đế thớt trên
5. Dùng chía khóa 30 tháo ốc 20 
6. Lấy mặt bích trên ra
7. Lấy packing ra kiểm tra nếu hư hỏng thì thay mới
8. Kiểm tra, dùng vài vệ sinh trong lồng
9. Thay packing mới (4 mềm 3 cứng)
10. Lắp vào và kiểm tra'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0005', 'KIỂM TRA, VỆ SINH VÀ BẢO DƯỠNG', 'PHẦN  CƠ', 'XY LANH ÉP PHỤ', 'THÁNG', '1. Bật công tắc nguồn
2. Nâng pittong chính lên
3. Dùng lục giác 4 tháo ốc pass cố định chốt  phần đầu pittoong phụ (tránh va chạm với thớt trên) và lấy  pass ra ngoài
4. Dùng lục giác 6 tháo ốc 8 (4 cái) ra và lấy mặt bích ra
5. Lấy vòng bạc ra
6. Lấy packing ra kiểm traneesu hư hỏng thì thay mới
7. Vệ sinh trong lồng
8. Thay packing mới (2 cứng 3 mềm)
9. Chỉnh kích thước mắt bịch lại
10. Lắp vào và kiểm tra'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0006', 'KIỂM TRA, VỆ SINH VÀ BẢO DƯỠNG', 'PHẦN  CƠ', 'XY LANH  ĐẦU', 'THÁNG', '1. Dùng khóa 24 tháo dây dầu
2. Dùng lục giác 10 tháo 2 ốc 12 (chân đỡ xyanh)
3. Lấy kiềm tháo phe, rút chốt cần pittong ra
4. Lấy xylanh đầu ra ngoài
5. Kiểm tra packing nếu hư hỏng thì thay thế
5.1 Dùng khóa 32 tháo con tán khớp nối đầu xylanh đầu
5.2 Dùng khóa 19 tháo tán 12 (4 cái ra)
5.3 Lấy khung pittong đầu ra 
5.4 Lấy packing (1 ngoài và 2 trong) ra
5.5 Thay mới 
5.6 Thay tiếp packing (2 cái) trong cốt xy lanh
6. Lắp vào và kiểm tra'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0007', 'KIỂM TRA, VỆ SINH VÀ BẢO DƯỠNG', 'PHẦN  CƠ', 'THANH RAY DI CHUYỂN THỚT DƯỚI RA VÀO', 'THÁNG', '1. Dùng lục giác 5 tháo 4 ốc 6 ra (6 cái)
2. Lấy tấm chắn bảo vệ ra
3. Kích van cho tấm thớt dưới chạy ra
4. Dùng súng hơi và lục giác 10 tháo ốc (10 cái) 2 bên thanh ray ra 
5. Lấy pass L trên ra
6. Dùng súng hơi và lục giác 10 tháo ốc (6 cái) 2 bên ra
7. Dùng súng hơi vệ sinh và chà phần dơ ra
8. Dùng mỡ bò chét 2 bên thanh ray
9. Lắp vào và kiểm tra'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0008', 'KIỂM TRA, VỆ SINH VÀ SIẾT CHẶT', 'PHẦN ĐIỆN', 'TỦ ĐIỆN NGUỒN', 'THÁNG', '1 Tắt nguồn điện tổng 
2 Kiểm tra các dây điện mắc vào domino  và linh kiện được treo lên chắc chắn
3 Dùng tua-vít siết chặt lại các dây bị lỏng 
4 Vệ sinh xung quanh bằng chổi quét bo 
5 Dùng súng hơi xịt các khe góc sâu trong tủ'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0009', 'KIỂM TRA, VỆ SINH VÀ BẢO DƯỠNG', 'PHẦN CƠ', 'BỒN DẦU', 'THÁNG', '1. Dùng tay kéo nắp che phía sau lên
2. Kiểm tra phần hiển thị mức dầu (nếu nằm mức giữa thì châm dầu thêm)
3. Tháo lọc dầu ra kiểm tra và vệ sinh, nếu hư thì thay mới
4. Lấy dầu trong bồn đi  kiểm tra, nếu k đạt thì thay mới
5. Vệ sinh bên trong và bên ngoài bồn dầu
6. Kiểm tra và ghi nhận áp suất dầu
7. Kiểm tra và ghi nhận dòng bơm 
8. Kiểm tra ống dầu, khớp nối cố định'),
  ('SDL PRESS OUTSOLE', 'SDL PRESS OUTSOLE', 'PM0010', 'KIỂM TRA, VỆ SINH VÀ BẢO DƯỠNG', 'PHẦN ĐIỆN', 'MOTOR ĐIỆN', 'TUẦN', '1. Dùng tay kéo nắp che phía sau lên
2. Nhấn nút start để kiểm tra tiếng ồn motor 
3. Dùng đồng hồ kiểm tra ampe của motor điện
4. Kiểm tra, siết chặt ốc cố định motor trên bồn dầu'),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0001', 'Kiểm tra, bảo dưỡng dây điện', 'PHẦN ĐIỆN', '', 'Tháng', ''),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0002', 'Kiểm tra, bảo dưỡng kim và ổ kim', 'PHẦN CƠ', '', 'Tháng', ''),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0003', 'Kiểm tra, bảo dưỡng lao dầu và hốt chỉ', 'PHẦN CƠ', '', 'Quaterly', ''),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0004', 'Kiểm tra, bảo dưỡng bánh xe và bàn đạp', 'PHẦN CƠ', '', 'Tháng', ''),
  ('ZigZag Machine', 'ZigZag Machine', 'STT-PM0005', 'Kiểm tra, bảo dưỡng dây curoa', 'PHẦN CƠ', '', 'Tháng', '')
;

COMMIT;

-- Verify:
SELECT equipment, name_en, count(*) AS rows FROM pm_tasks GROUP BY equipment, name_en ORDER BY equipment, name_en;
