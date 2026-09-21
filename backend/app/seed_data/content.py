"""Starter content for a fresh install. Everything here is editable from the admin dashboard.

Only facts published on eliteescapetourism.com belong here. Do not add visa fees, processing times,
per-country document lists or blog posts unless the business has supplied and approved them.
"""

# (country, flag, group, visa type, fee, processing, requirements)
# The ten destinations listed in the live site's visa-assistance section. Fee 0 and "On enquiry"
# mean "not published": the public site must show "Contact us" rather than a price or timeline.
VISA_GROUP = "Visa Assistance"
VISA_TYPE = "Visa assistance"
VISA_COUNTRIES = [
    ("United States", "🇺🇸", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("United Kingdom", "🇬🇧", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("Canada", "🇨🇦", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("Australia", "🇦🇺", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("China", "🇨🇳", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("Singapore", "🇸🇬", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("Indonesia", "🇮🇩", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("Georgia", "🇬🇪", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("Philippines", "🇵🇭", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
    ("France", "🇫🇷", VISA_GROUP, VISA_TYPE, 0, "On enquiry", None),
]

# Intentionally empty: publish blog posts from the dashboard once real, reviewed content exists.
BLOG_POSTS: list[dict] = []
