"""End-to-end check of the SolarSizer AI landing page.

Run with the dev server up (calls the real NVIDIA + NASA APIs):
    python e2e/test_landing.py [base_url]
Screenshots land in e2e/shots/.
"""
import re
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3023"
SHOTS = Path(__file__).parent / "shots"
SHOTS.mkdir(exist_ok=True)
results = []


def check(name, fn):
    try:
        fn()
        results.append((True, name))
    except Exception as e:  # report every failure, keep going
        results.append((False, f"{name}: {str(e).splitlines()[0][:160]}"))


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))

    page.goto(BASE, timeout=90000)
    page.get_by_role("heading", level=1).wait_for(timeout=90000)
    page.wait_for_timeout(3000)  # let the sunrise finish for the screenshot
    page.screenshot(path=str(SHOTS / "1-hero-desktop.png"))

    size_btn = page.get_by_role("button", name="Size my system")
    check("hero headline visible", lambda: expect(page.get_by_role("heading", level=1)).to_contain_text("solar system"))
    check("size button disabled when empty", lambda: expect(size_btn).to_be_disabled())

    # Bad input: AI should reject non-appliance text with a clear message.
    page.get_by_role("textbox", name="What do you want to power?").fill("hello")
    size_btn.click()
    check("nonsense input shows error", lambda: expect(page.get_by_role("alert").filter(has_text=re.compile("Could not read|AI is slow"))).to_be_visible(timeout=60000))
    check("empty state invites manual entry", lambda: expect(page.get_by_text("Add at least one appliance")).to_be_visible())

    # Happy path: example shop.
    page.get_by_role("button", name="Fill in an example shop").click()
    check("example fills fuel", lambda: expect(page.get_by_role("spinbutton", name=re.compile("Petrol"))).to_have_value("25000"))
    size_btn.click()
    check("loading message shown", lambda: expect(page.get_by_text("This takes about 10 seconds")).to_be_visible())
    check("AI returns appliances", lambda: expect(page.get_by_label("Appliance name")).to_have_count(4, timeout=60000))
    check("results heading names city", lambda: expect(page.get_by_role("heading", name="Your system for Lagos")).to_be_visible())
    check("payback sentence", lambda: expect(page.get_by_text(re.compile(r"pays for itself in about \d+ months"))).to_be_visible())
    check("total cost in naira", lambda: expect(page.get_by_text(re.compile(r"₦\s?[\d,]+")).first).to_be_visible())
    check("payback chart rendered", lambda: expect(page.get_by_role("img", name=re.compile("Solar pays back in month"))).to_be_visible())
    page.wait_for_timeout(500)
    page.screenshot(path=str(SHOTS / "2-results-desktop.png"), full_page=False)

    # Editing a row recalculates without another AI call.
    total_before = page.locator("dl div").last.inner_text()
    qty = page.get_by_label("Quantity").first
    qty.fill("4")
    check("editing qty changes total", lambda: expect(page.locator("dl div").last).not_to_have_text(total_before))

    # Removing every row shows the empty state, never NaN.
    for _ in range(page.get_by_label("Appliance name").count()):
        page.get_by_role("button", name=re.compile("^Remove")).first.click()
    check("all rows removed shows empty state", lambda: expect(page.get_by_text("Add at least one appliance")).to_be_visible())
    check("no NaN or Infinity on page", lambda: expect(page.locator("body")).not_to_contain_text(re.compile("NaN|Infinity")))

    # Fuel cleared: payback message changes, no crash.
    page.get_by_role("button", name="+ Add appliance").click()
    page.get_by_role("spinbutton", name=re.compile("Petrol")).fill("")
    check("no fuel shows payback prompt", lambda: expect(page.get_by_text("Enter how much petrol you buy each week")).to_be_visible())

    # Changing city refetches sun data.
    page.get_by_role("combobox", name="City").select_option("kano")
    check("city change updates heading", lambda: expect(page.get_by_role("heading", name="Your system for Kano")).to_be_visible())

    page.screenshot(path=str(SHOTS / "3-full-desktop.png"), full_page=True)

    # Mobile layout.
    m = browser.new_page(viewport={"width": 375, "height": 812}, is_mobile=True)
    m.goto(BASE, timeout=90000)
    m.get_by_role("heading", level=1).wait_for(timeout=90000)
    m.wait_for_timeout(3000)
    overflow = m.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    check("no horizontal scroll on mobile", lambda: (_ for _ in ()).throw(AssertionError(f"overflow {overflow}px")) if overflow > 0 else None)
    m.screenshot(path=str(SHOTS / "4-hero-mobile.png"))
    m.screenshot(path=str(SHOTS / "5-full-mobile.png"), full_page=True)

    check("no JS errors", lambda: (_ for _ in ()).throw(AssertionError("; ".join(errors)[:300])) if [e for e in errors if "422" not in e] else None)
    browser.close()

for ok, name in results:
    print(("PASS " if ok else "FAIL ") + name)
print(f"\n{sum(ok for ok, _ in results)}/{len(results)} passed")
sys.exit(0 if all(ok for ok, _ in results) else 1)
