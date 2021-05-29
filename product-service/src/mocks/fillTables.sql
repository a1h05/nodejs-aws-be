create extension if not exists "uuid-ossp";

drop table if exists products cascade;

create table products (
	id uuid primary key default uuid_generate_v4(),
	title text not null,
	description text,
	price integer
);

drop table if exists stocks;

create table stocks (
 product_id uuid,
 count integer,
 foreign key ("product_id") references "products" ("id")
);


insert into products (id, title, description, price) values
('7567ec4b-b10c-48c5-9345-fc73c48a80aa', 'A Smarter Way to Learn JavaScript: The new tech-assisted approach that requires half the effort', 'Author – Mark Myers', 2.4),
('7567ec4b-b10c-48c5-9345-fc73c48a80a0', 'Eloquent JavaScript: A Modern Introduction to Programming', 'Author – Marjin Haverbeke', 10),
('7567ec4b-b10c-48c5-9345-fc73c48a80a2', 'JavaScript & JQuery: Interactive Front-End Web Development', 'Author – Jon Duckett', 23),
('7567ec4b-b10c-48c5-9345-fc73c48a80a1', 'JavaScript: The Good Parts', 'Author – Douglas Crockford', 15),
('7567ec4b-b10c-48c5-9345-fc73c48a80a3', 'Learn JavaScript VISUALLY', 'Author – Ivelin Demirov', 23),
('7567ec4b-b10c-48c5-9345-fc73348a80a1', 'JavaScript: The Definitive Guide', 'Author – David Flanagan', 15),
('7567ec4b-b10c-48c5-9445-fc73c48a80a2', 'Effective JavaScript: 68 Specific Ways to Harness the Power of JavaScript', 'Author – David Herman, Foreword by Brendan Eich', 23),
('7567ec4b-b10c-45c5-9345-fc73c48a80a1', 'JavaScript for Kids: A Playful Introduction to Programming', 'Author – Nick Morgan', 15);

insert into stocks (product_id, count) values
('7567ec4b-b10c-48c5-9345-fc73c48a80aa', 4),
('7567ec4b-b10c-48c5-9345-fc73c48a80a0', 6),
('7567ec4b-b10c-48c5-9345-fc73c48a80a2', 7),
('7567ec4b-b10c-48c5-9345-fc73c48a80a1', 12),
('7567ec4b-b10c-48c5-9345-fc73c48a80a3', 7),
('7567ec4b-b10c-48c5-9345-fc73348a80a1', 8),
('7567ec4b-b10c-48c5-9445-fc73c48a80a2', 2),
('7567ec4b-b10c-45c5-9345-fc73c48a80a1', 3);
