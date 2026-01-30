-- Seed script for storyteller tags based on imagineyourepregnant.tumblr.com content

INSERT INTO "Tag" (id, name, category, description, "isNsfw", "usageCount") VALUES
-- Genre Tags
('tag_fantasy', 'Fantasy', 'GENRE', 'Fantasy and magical elements', false, 0),
('tag_historical', 'Historical', 'GENRE', 'Historical settings and periods', false, 0),
('tag_modern', 'Modern', 'GENRE', 'Contemporary settings', false, 0),
('tag_sci_fi', 'Science Fiction', 'GENRE', 'Futuristic and sci-fi elements', false, 0),
('tag_horror', 'Horror', 'GENRE', 'Horror and suspense elements', false, 0),
('tag_dark_comedy', 'Dark Comedy', 'GENRE', 'Black comedy and dark humor', false, 0),

-- Theme Tags
('tag_pregnancy', 'Pregnancy', 'THEME', 'Central pregnancy themes', true, 0),
('tag_forced_preg', 'Forced Pregnancy', 'THEME', 'Non-consensual impregnation', true, 0),
('tag_rapid_preg', 'Rapid Pregnancy', 'THEME', 'Accelerated pregnancy progression', true, 0),
('tag_multiple_preg', 'Multiple Pregnancy', 'THEME', 'Twins, triplets, or more', true, 0),
('tag_unplanned_preg', 'Unplanned Pregnancy', 'THEME', 'Accidental or surprise pregnancy', true, 0),
('tag_genetic_alt', 'Genetic Alteration', 'THEME', 'Body modification or transformation', true, 0),
('tag_curse', 'Curse', 'THEME', 'Magical curses or spells', false, 0),
('tag_mythological', 'Mythological Creature', 'THEME', 'Fantasy creatures and beings', false, 0),
('tag_supernatural', 'Supernatural', 'THEME', 'Supernatural elements', false, 0),
('tag_birth', 'Birth', 'THEME', 'Labor and delivery scenes', true, 0),
('tag_breeding', 'Breeding', 'THEME', 'Breeding and reproduction focus', true, 0),
('tag_inflation', 'Inflation', 'THEME', 'Body expansion themes', true, 0),

-- Content Warning Tags
('tag_nsfw', 'NSFW', 'CONTENT_WARNING', 'Not safe for work content', true, 0),
('tag_rape', 'Rape/Non-Con', 'CONTENT_WARNING', 'Non-consensual sexual content', true, 0),
('tag_gore', 'Gore', 'CONTENT_WARNING', 'Graphic violence or injury', true, 0),
('tag_death', 'Death', 'CONTENT_WARNING', 'Character death', true, 0),
('tag_violence', 'Violence', 'CONTENT_WARNING', 'Physical violence', true, 0),
('tag_difficult_birth', 'Difficult Birth', 'CONTENT_WARNING', 'Painful or complicated delivery', true, 0),
('tag_public_birth', 'Public Birth', 'CONTENT_WARNING', 'Birth in public settings', true, 0),
('tag_medical', 'Medical', 'CONTENT_WARNING', 'Medical procedures or settings', false, 0),
('tag_age_gap', 'Age Gap', 'CONTENT_WARNING', 'Significant age differences', true, 0),
('tag_dubcon', 'Dubious Consent', 'CONTENT_WARNING', 'Questionable consent', true, 0),

-- Mood Tags
('tag_dark', 'Dark', 'MOOD', 'Dark or serious tone', false, 0),
('tag_tense', 'Tense', 'MOOD', 'High tension or suspense', false, 0),
('tag_emotional', 'Emotional', 'MOOD', 'Heavy emotional content', false, 0),
('tag_erotic', 'Erotic', 'MOOD', 'Sexually explicit content', true, 0),
('tag_disturbing', 'Disturbing', 'MOOD', 'Unsettling or disturbing themes', true, 0),
('tag_humorous', 'Humorous', 'MOOD', 'Comedy or humor', false, 0),
('tag_romantic', 'Romantic', 'MOOD', 'Romance elements', false, 0),
('tag_angst', 'Angst', 'MOOD', 'Emotional pain or distress', false, 0),

-- Setting Tags
('tag_farm', 'Farm', 'SETTING', 'Rural farm settings', false, 0),
('tag_manor', 'Manor', 'SETTING', 'Estate or manor house', false, 0),
('tag_school', 'School', 'SETTING', 'Educational institutions', false, 0),
('tag_hospital', 'Hospital', 'SETTING', 'Medical facilities', false, 0),
('tag_military', 'Military', 'SETTING', 'Military or war settings', false, 0),
('tag_aquarium', 'Aquarium', 'SETTING', 'Underwater or aquatic settings', false, 0),
('tag_desert', 'Desert', 'SETTING', 'Desert environments', false, 0),
('tag_home', 'Home', 'SETTING', 'Domestic settings', false, 0),
('tag_workplace', 'Workplace', 'SETTING', 'Professional environments', false, 0),

-- Character Type Tags
('tag_pregnant_woman', 'Pregnant Woman', 'CHARACTER_TYPE', 'Female pregnancy', true, 0),
('tag_pregnant_man', 'Pregnant Man', 'CHARACTER_TYPE', 'Male pregnancy (mpreg)', true, 0),
('tag_trans_char', 'Trans Character', 'CHARACTER_TYPE', 'Transgender characters', false, 0),
('tag_nonbinary_char', 'Non-Binary Character', 'CHARACTER_TYPE', 'Non-binary characters', false, 0),
('tag_soldier', 'Soldier', 'CHARACTER_TYPE', 'Military personnel', false, 0),
('tag_teacher', 'Teacher', 'CHARACTER_TYPE', 'Educational professionals', false, 0),
('tag_student', 'Student', 'CHARACTER_TYPE', 'Students or pupils', false, 0),
('tag_farmer', 'Farmer', 'CHARACTER_TYPE', 'Agricultural workers', false, 0),
('tag_mermaid', 'Mermaid', 'CHARACTER_TYPE', 'Aquatic beings', false, 0),
('tag_beast', 'Beast/Creature', 'CHARACTER_TYPE', 'Non-human beings', false, 0),
('tag_hybrid', 'Hybrid', 'CHARACTER_TYPE', 'Human-animal hybrids', false, 0),
('tag_lawyer', 'Lawyer', 'CHARACTER_TYPE', 'Legal professionals', false, 0),
('tag_rancher', 'Rancher', 'CHARACTER_TYPE', 'Livestock farmers', false, 0);