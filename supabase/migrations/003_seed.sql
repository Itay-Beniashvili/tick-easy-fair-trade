-- 003_seed.sql — sample events + tickets for the test accounts.
-- manager@tickeasy.test = a62ca73e-76c8-4d7f-a516-0f7619c2fc70
-- buyer@tickeasy.test    = 71e4183e-6086-460b-98a6-373063e68c93

insert into public.events (id, manager_id, title, artist, venue, city, event_date, event_time, price, original_price, image, genre, description, total_tickets, available_tickets)
values
 ('10000000-0000-4000-8000-000000000001','a62ca73e-76c8-4d7f-a516-0f7619c2fc70','Taylor Swift - Eras Tour','Taylor Swift','SoFi Stadium','Los Angeles','2026-08-15','19:00',350,350,'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=80','music','The record-breaking Eras Tour, live.',200,156),
 ('10000000-0000-4000-8000-000000000002','a62ca73e-76c8-4d7f-a516-0f7619c2fc70','Lakers vs Warriors','NBA','Crypto.com Arena','Los Angeles','2026-09-22','19:30',450,450,'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80','sports','The ultimate NBA showdown.',120,89),
 ('10000000-0000-4000-8000-000000000003','a62ca73e-76c8-4d7f-a516-0f7619c2fc70','Electric Daisy Carnival','Various Artists','Las Vegas Motor Speedway','Las Vegas','2026-10-05','17:00',280,280,'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&auto=format&fit=crop&q=80','music','The world''s largest dance music festival.',300,234),
 ('10000000-0000-4000-8000-000000000004','a62ca73e-76c8-4d7f-a516-0f7619c2fc70','Hamilton - Broadway','Lin-Manuel Miranda','Richard Rodgers Theatre','New York','2026-08-28','20:00',180,180,'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=80','theater','The revolutionary musical.',80,45),
 ('10000000-0000-4000-8000-000000000005','a62ca73e-76c8-4d7f-a516-0f7619c2fc70','Coldplay - Music of the Spheres','Coldplay','MetLife Stadium','New Jersey','2026-11-12','19:30',400,400,'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=80','music','A dazzling stadium spectacle.',250,210),
 ('10000000-0000-4000-8000-000000000006','a62ca73e-76c8-4d7f-a516-0f7619c2fc70','The Lion King','Disney','Minskoff Theatre','New York','2026-12-01','19:00',160,160,'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&auto=format&fit=crop&q=80','theater','Broadway''s beloved classic.',90,70)
on conflict (id) do nothing;

-- Buyer's wallet (2 owned tickets) ------------------------------------
insert into public.tickets (user_id, event_id, event_title, event_venue, event_city, event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale, sale_price)
values
 ('71e4183e-6086-460b-98a6-373063e68c93','10000000-0000-4000-8000-000000000001','Taylor Swift - Eras Tour','SoFi Stadium','Los Angeles','2026-08-15','19:00','https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=80','standard','Sec A · Row 5 · Seat 12',350,'TKT-seedbuyer0001',false,null),
 ('71e4183e-6086-460b-98a6-373063e68c93','10000000-0000-4000-8000-000000000004','Hamilton - Broadway','Richard Rodgers Theatre','New York','2026-08-28','20:00','https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop&q=80','standard','Mezzanine · Row 3 · Seat 15',180,'TKT-seedbuyer0002',true,150)
on conflict do nothing;

-- Manager-owned tickets listed for resale (so the buyer can purchase one) ---
insert into public.tickets (user_id, event_id, event_title, event_venue, event_city, event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale, sale_price)
values
 ('a62ca73e-76c8-4d7f-a516-0f7619c2fc70','10000000-0000-4000-8000-000000000002','Lakers vs Warriors','Crypto.com Arena','Los Angeles','2026-09-22','19:30','https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80','standard','VIP · Row 2 · Seat 8',450,'TKT-seedsell0001',true,400),
 ('a62ca73e-76c8-4d7f-a516-0f7619c2fc70','10000000-0000-4000-8000-000000000001','Taylor Swift - Eras Tour','SoFi Stadium','Los Angeles','2026-08-15','19:00','https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop&q=80','standard','Sec B · Row 8 · Seat 24',350,'TKT-seedsell0002',true,320)
on conflict do nothing;
