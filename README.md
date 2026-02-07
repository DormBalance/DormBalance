DormBalance (Roommate Expense + Split Tracker) — Feature/Layout Guide
Project Summary

DormBalance is a web/app system designed specifically for college roommates who want a simple way to:

track personal + shared expenses (rent, groceries, utilities),

automatically calculate who owes who,

and record “settle up” payments.

The system supports multiple households (groups), role-based access (Admin vs Member), and a central database that updates dynamically as people add expenses and payments.

1) Users + Authentication
Purpose

Provide secure access to the app and personal profiles.

What the system stores

name

email (unique)

password_hash (bcrypt/argon2; never store raw password)

created_at

optional: profile picture, phone, Venmo handle (display-only)

User actions

Register account (name/email/password)

Login / Logout

View & edit profile (name, optional fields)

Change password (optional stretch)

Key screens

Register page

Login page

Profile page

Logout button in navbar/settings

2) Groups (Households)
Purpose

A “group” represents a household (apartment, dorm suite, house) where expenses are shared.

What the system stores

group name (e.g., “Apt 3B”, “Jennings Suite 204”)

invite code (unique join code)

created_by (user_id) (creator becomes admin)

optional: group currency, group default split rule

User actions

Create a new group (becomes Admin)

Join an existing group using invite code

Switch between groups (if a user is in multiple)

Key screens

“Create or Join Group” screen

Group dashboard landing page

Group settings page (admin only)

3) Membership + Roles
Purpose

A user can be a member of multiple groups, and roles control what they can manage.

Roles

Admin

Can manage group members

Can manage group categories

Can handle disputes (if enabled)

Can generate/load sample data for demo/testing (optional)

Member

Can add expenses

Can view balances

Can record settlements

Can flag an expense (if disputes enabled)

What the system stores

group_id

user_id

role (“admin” or “member”)

joined_at

Admin actions (recommended)

Invite members (share invite code)

Remove members

Transfer admin (optional)

4) Expenses (Core Feature)
Purpose

Expenses are the main “items” in the system—every bill, grocery run, rent payment, etc.

What the system stores for each expense

group_id

payer_id (who paid)

amount

date

note/description (“Publix groceries”, “January rent”)

category (groceries/rent/utilities/etc.)

is_shared (shared vs personal)

status

simplest: “normal”

optional disputes: “flagged”, “approved”

Member actions

Add an expense

Choose: shared or personal

Select category

Enter amount/date/note

Edit or delete their own expense (optional rules)

View expense list with filters:

by month, payer, category, shared/personal, status

Admin actions (if disputes enabled)

Approve/resolve flagged expenses

Key screens

Add Expense form

Expense list/table

Expense detail page (optional)

5) Splits (Who owes what per expense)
Purpose

Splits are how we compute “who owes who.”
A split breaks a shared expense into individual shares for each participant.

What the system stores

For each shared expense, store one row per participant:

expense_id

user_id

share_amount (or share_percent)

Supported split methods (recommended)

Equal split

example: $80 groceries / 4 roommates = $20 each

Custom amounts

example: $100 utilities: A pays $40, B pays $30, C pays $30

Percent split (optional)

example: rent split 40/30/30

How it works conceptually

When a shared expense is added:

payer is effectively “credited”

other participants are “debited” by their share
Balances are derived from: splits - settlements.

Key screens (part of Add Expense)

“Split type: Equal / Custom / Percent”

Select participants

Input shares

6) Settlements (Settle Up Payments)
Purpose

Settlements record when roommates pay each other back. No real payment integration needed—just recording it.

What the system stores

group_id

from_user

to_user

amount

date

note (“Venmo”, “cash”, “paid utilities back”)

Member actions

Record a settlement payment

View settlement history

Key screens

Settle Up form

Settlement history list

7) Recurring Bills (Rent/Utilities Templates)
Purpose

Recurring bills auto-create repeated expenses like rent, Wi-Fi, subscriptions, utilities.

What the system stores

group_id

payer_id (default payer)

category_id

amount

note

frequency (weekly / monthly)

start_date

optional: end_date

split_method (equal/custom/percent)

last_generated_at (to know what’s already been created)

How generation works (simple + reliable)

When a user loads the dashboard (or presses “Generate recurring”):

backend checks each recurring bill

if new cycles have passed since last_generated_at, it creates real expense + splits entries

updates last_generated_at

User actions

Create recurring bill template (admin or all members—your choice)

Edit/disable recurring bill

View schedule/history

Key screens

Recurring bills list

Create/edit recurring bill form

“Must-have” Pages for the Demo

Login/Register

Group Create/Join

Dashboard (monthly totals + balances summary)

Add Expense (with split)

Expense List (filters)

Balances (“You owe / You are owed”)

Settle Up (record payment)

Profile + Logout

Admin pages (minimum):

Members management

(optional) Dispute resolution

(optional) Load sample data
