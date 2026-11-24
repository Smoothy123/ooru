-- Ooru sample data: 21 posts in Telugu and English across the three districts.
-- Run after schema.sql, in the Supabase SQL Editor (which bypasses RLS, so it
-- can insert "news" posts that the public API can't).
-- Fixed ids + "on conflict do nothing" make it safe to run more than once.
-- Times are relative to now() so the feed always looks fresh.

insert into public.posts (id, type, district, title, body, price, image_url, author_name, created_at)
values
  -- Hyderabad ---------------------------------------------------------------
  ('00000000-0000-4000-8000-000000000001', 'news', 'hyderabad',
   'Metro Red Line to run extra trains on Sunday night',
   'Hyderabad Metro will run additional trains every 10 minutes between Miyapur and LB Nagar until 11:30 pm this Sunday.',
   null, null, 'Ooru Desk', now() - interval '2 hours'),

  ('00000000-0000-4000-8000-000000000002', 'news', 'hyderabad',
   'ట్యాంక్ బండ్‌పై ఆదివారం సాయంత్రం వాహనాలకు అనుమతి లేదు',
   'సండే ఫన్‌డే కార్యక్రమం కోసం సాయంత్రం 5 నుంచి రాత్రి 10 వరకు ట్యాంక్ బండ్ రోడ్డుపై వాహనాల రాకపోకలు నిలిపివేయబడతాయి. ప్రత్యామ్నాయ మార్గాలను ఉపయోగించండి.',
   null, null, 'ఊరు డెస్క్', now() - interval '6 hours'),

  ('00000000-0000-4000-8000-000000000003', 'classified', 'hyderabad',
   'Royal Enfield Classic 350, 2021, single owner',
   'Well maintained, 18,000 km, all service records available. Kukatpally. Call after 6 pm.',
   135000, null, 'Ravi K.', now() - interval '5 hours'),

  ('00000000-0000-4000-8000-000000000004', 'classified', 'hyderabad',
   '2BHK ఫ్లాట్ అద్దెకు — కూకట్‌పల్లి',
   'మెట్రో స్టేషన్‌కు 5 నిమిషాల దూరం. కుటుంబాలకు మాత్రమే. నెల అద్దె, మెయింటెనెన్స్ అదనం.',
   18000, null, 'లక్ష్మి', now() - interval '26 hours'),

  ('00000000-0000-4000-8000-000000000005', 'classified', 'hyderabad',
   'Study table and chair, barely used',
   'Engineered wood table with a drawer and a matching chair. Pick up from Madhapur.',
   2500, null, 'Ananya', now() - interval '40 hours'),

  ('00000000-0000-4000-8000-000000000006', 'news', 'hyderabad',
   'Weekend organic farmers'' market at People''s Plaza',
   'Farmers from Medak and Rangareddy will sell vegetables, millets and cold-pressed oils on Saturday and Sunday, 7 am to 1 pm.',
   null, null, 'Ooru Desk', now() - interval '52 hours'),

  ('00000000-0000-4000-8000-000000000007', 'classified', 'hyderabad',
   'వంట మనిషి కావాలి — మాదాపూర్',
   'ఉదయం మరియు సాయంత్రం ఇద్దరు వ్యక్తులకు వంట చేయడానికి అనుభవం ఉన్నవారు కావాలి. నెల జీతం.',
   12000, null, 'సుజాత', now() - interval '70 hours'),

  -- Vijayawada --------------------------------------------------------------
  ('00000000-0000-4000-8000-000000000008', 'news', 'vijayawada',
   'బెంజ్ సర్కిల్ ఫ్లైఓవర్‌పై శుక్రవారం వరకు ఒక లేన్ మూసివేత',
   'మరమ్మతు పనుల కారణంగా ఉదయం 10 నుంచి సాయంత్రం 5 వరకు ఒక లేన్ మూసివేయబడుతుంది. ప్రత్యామ్నాయ మార్గాలు ఉపయోగించండి.',
   null, null, 'ఊరు డెస్క్', now() - interval '3 hours'),

  ('00000000-0000-4000-8000-000000000009', 'news', 'vijayawada',
   'Punnami Ghat gets a new walking track and lights',
   'The municipal corporation has opened a 1.2 km walking track with new lighting along Punnami Ghat. Open from 5 am to 9 pm.',
   null, null, 'Ooru Desk', now() - interval '9 hours'),

  ('00000000-0000-4000-8000-000000000010', 'classified', 'vijayawada',
   'Honda Activa 6G, 2022, 9,000 km',
   'Pearl white, new tyres, insurance valid till March. Price slightly negotiable.',
   62000, null, 'Sai Teja', now() - interval '8 hours'),

  ('00000000-0000-4000-8000-000000000011', 'classified', 'vijayawada',
   'పాత పాఠ్య పుస్తకాలు ఉచితం',
   'ఇంటర్ ఫస్ట్ ఇయర్ MPC పుస్తకాలు. అవసరమైన విద్యార్థులు తీసుకోవచ్చు.',
   0, null, 'మాధవి', now() - interval '30 hours'),

  ('00000000-0000-4000-8000-000000000012', 'classified', 'vijayawada',
   'గణితం, సైన్స్ ట్యూషన్ — 8 నుంచి 10వ తరగతి',
   'సాయంత్రం 6 నుంచి 8 వరకు, పటమట. నెల ఫీజు. చిన్న బ్యాచ్‌లు మాత్రమే.',
   1500, null, 'రమేష్', now() - interval '20 hours'),

  ('00000000-0000-4000-8000-000000000013', 'classified', 'vijayawada',
   'Samsung 1.5 ton split AC, 3 years old',
   'Inverter AC, cools well, serviced last month. Buyer arranges uninstallation.',
   18000, null, 'Kiran', now() - interval '45 hours'),

  ('00000000-0000-4000-8000-000000000014', 'news', 'vijayawada',
   'Blood donation camp at Government General Hospital on Saturday',
   'The camp runs from 9 am to 4 pm. Donors aged 18 to 60 can walk in; please carry a photo ID.',
   null, null, 'Ooru Desk', now() - interval '75 hours'),

  -- Visakhapatnam -----------------------------------------------------------
  ('00000000-0000-4000-8000-000000000015', 'news', 'visakhapatnam',
   'RK Beach clean-up drive this Sunday, volunteers welcome',
   'Residents'' groups are organising a beach clean-up from 6 am to 9 am. Gloves and bags will be provided.',
   null, null, 'Ooru Desk', now() - interval '4 hours'),

  ('00000000-0000-4000-8000-000000000016', 'news', 'visakhapatnam',
   'బీచ్ రోడ్డులో వారాంతపు ట్రాఫిక్ మార్పులు',
   'శని, ఆదివారాల్లో సాయంత్రం 4 గంటల తర్వాత ఆర్కే బీచ్ నుంచి పార్క్ హోటల్ జంక్షన్ వరకు వన్‌వే అమలులో ఉంటుంది.',
   null, null, 'ఊరు డెస్క్', now() - interval '10 hours'),

  ('00000000-0000-4000-8000-000000000017', 'classified', 'visakhapatnam',
   'Used Dell laptop, Core i5, 8 GB RAM',
   'Good battery, minor scratches on the lid. Charger included. MVP Colony.',
   22000, null, 'Pavan', now() - interval '12 hours'),

  ('00000000-0000-4000-8000-000000000018', 'classified', 'visakhapatnam',
   'ఇల్లు అద్దెకు — 1BHK, సీతమ్మధార',
   'రెండో అంతస్తు, నీటి సౌకర్యం 24 గంటలు. బ్యాచిలర్స్‌కు కూడా ఇవ్వబడును.',
   9000, null, 'శ్రీనివాస్', now() - interval '48 hours'),

  ('00000000-0000-4000-8000-000000000019', 'classified', 'visakhapatnam',
   'Guitar lessons for beginners, weekends',
   'Acoustic guitar basics, 8 classes a month at Dwaraka Nagar. Fee is per month.',
   2000, null, 'Nikhil', now() - interval '22 hours'),

  ('00000000-0000-4000-8000-000000000020', 'news', 'visakhapatnam',
   'Kailasagiri ropeway closed for maintenance on Monday',
   'The ropeway will stay closed all day for its annual safety check. The hilltop park remains open by road.',
   null, null, 'Ooru Desk', now() - interval '60 hours'),

  ('00000000-0000-4000-8000-000000000021', 'classified', 'visakhapatnam',
   'సైకిల్ అమ్మకానికి — హెర్క్యులస్, గేర్లతో',
   'రెండు సంవత్సరాలు వాడినది. కొత్త టైర్లు. గాజువాక.',
   4500, null, 'వెంకట్', now() - interval '80 hours')
on conflict (id) do nothing;
