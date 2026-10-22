# Chapter and city status

Verified for this implementation: 16 October 2026. No production chapter data was changed or certified.

## Inventory

- 30 existing founder-supplied locations retained, including Bengaluru, London, Paris, Stockholm and Bern.
- 49 requested candidates added: Italy 6; additional Europe 16; North America 7; South America 4; Asia 9; Africa 5; Oceania 2.
- Total static locations: **79**, all **expansion interest**. **0 verified active chapter claims** in the static directory. This is not evidence that the organization has no active chapters; live operating records were not certified.
- IDs remain stable for existing locations (including the original Brasília ID); added IDs normalize accented characters. Both IDs and city/country pairs are unique.

## Source and operating boundaries

The current [Chapter Starter Kit v1.1](https://docs.google.com/document/d/1c1vImc_M6jXFVFekLxR4iTmXdZ-t81P1HyyLJYUUt_k/edit), dated 18 September 2026, was read through the connected Drive account. Its activation standard requires an accepted accountable lead, local permissions, a real first activity and subsequent evidence. Internal candidate names were not copied into public content. FinanceMeta-Global `OPERATING_SYSTEM_2026.md` separately defines active evidence within a trailing 45-day window; the kit uses a 30-day health pulse. Those are different measures, not interchangeable counts.

New coordinates come from [Natural Earth populated places](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/), matching each city and country rather than names alone. This avoids confusing Florence/Naples/Melbourne/Vancouver with same-name cities elsewhere. Natural Earth names København, Bogota, Montréal and Zürich are presented under the requested display names. Approximate central-city coordinates are suitable for discovery, not venue navigation. Legacy coordinates were retained; no address or participant location is implied.

Reference file: `nvkelso/natural-earth-vector/geojson/ne_10m_populated_places_simple.geojson`, fetched 16 October 2026. SHA-256: `fd3fa867a320cbd5c5b6bb5bc550afeec2939fb2cef688e508007282a55ac42f`. [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/) designate the geographic data public domain. The full geographic dataset was not added as a runtime dependency.

## Intake reconciliation

Connected Tally verification on 16 October: `WJ99ea` remains DRAFT; `XxaB1j` is published/open as the historical route; `kbayyj` is the published/open consolidated Finance4All interest intake containing international chapter/affiliate proposals and permission language. The public chapter CTA uses the returned canonical [consolidated interest form](https://tally.so/r/kbayyj). No form was published or submitted during this implementation. Interest does not confer membership, leadership, acceptance or chapter approval.

## Interface

`/chapters` and `/portal/chapters` share the map and directory. Search normalizes accents; filters cover region, country and the explicit chapter lifecycle. Clustered markers zoom into nearby cities, while every location remains reachable from the keyboard-accessible text directory. `?city=<stable-id>` links select the city. Reset clears filters. The status legend distinguishes interest, application received, lead screening, pre-launch, approved, active verified, and inactive/archive. A separate unverified state covers records whose operating evidence is missing.

The member event workspace separately reads reviewed Supabase chapter records. Publication approval does not imply an operating chapter, and member counts are no longer used as activation evidence. Admin chapter maintenance supports the lifecycle and revision-fenced draft edits. The additive migration defaults legacy records to unverified. Active records require accepted ownership, confirmed permissions and a valid operating-evidence URL/activity date; the member mapper additionally requires that activity to be in the previous 45 days and never in the future. Status/evidence edits invalidate publication approval. No private owner names or participant evidence were seeded.

## Locations

| City | Country / territory | Region | Status |
| --- | --- | --- | --- |
| New York | United States | North America | Expansion interest |
| Newark, New Jersey | United States | North America | Expansion interest |
| Austin, Texas | United States | North America | Expansion interest |
| Dallas, Texas | United States | North America | Expansion interest |
| Tampa, Florida | United States | North America | Expansion interest |
| Orlando, Florida | United States | North America | Expansion interest |
| Los Angeles | United States | North America | Expansion interest |
| Las Vegas, Nevada | United States | North America | Expansion interest |
| Portland, Oregon | United States | North America | Expansion interest |
| Chicago | United States | North America | Expansion interest |
| Detroit | United States | North America | Expansion interest |
| Brasília | Brazil | South America | Expansion interest |
| Buenos Aires | Argentina | South America | Expansion interest |
| Paris | France | Europe | Expansion interest |
| London | United Kingdom | Europe | Expansion interest |
| Bern | Switzerland | Europe | Expansion interest |
| Stockholm | Sweden | Europe | Expansion interest |
| Cairo | Egypt | Africa | Expansion interest |
| Pretoria | South Africa | Africa | Expansion interest |
| Nairobi | Kenya | Africa | Expansion interest |
| Dubai | United Arab Emirates | Asia | Expansion interest |
| Riyadh | Saudi Arabia | Asia | Expansion interest |
| Bengaluru | India | Asia | Expansion interest |
| Mumbai | India | Asia | Expansion interest |
| New Delhi | India | Asia | Expansion interest |
| Beijing | China | Asia | Expansion interest |
| Shanghai | China | Asia | Expansion interest |
| Tokyo | Japan | Asia | Expansion interest |
| Canberra | Australia | Oceania | Expansion interest |
| Sydney | Australia | Oceania | Expansion interest |
| Milan | Italy | Europe | Expansion interest |
| Rome | Italy | Europe | Expansion interest |
| Turin | Italy | Europe | Expansion interest |
| Bologna | Italy | Europe | Expansion interest |
| Florence | Italy | Europe | Expansion interest |
| Naples | Italy | Europe | Expansion interest |
| Berlin | Germany | Europe | Expansion interest |
| Munich | Germany | Europe | Expansion interest |
| Amsterdam | Netherlands | Europe | Expansion interest |
| Madrid | Spain | Europe | Expansion interest |
| Barcelona | Spain | Europe | Expansion interest |
| Lisbon | Portugal | Europe | Expansion interest |
| Vienna | Austria | Europe | Expansion interest |
| Prague | Czechia | Europe | Expansion interest |
| Warsaw | Poland | Europe | Expansion interest |
| Copenhagen | Denmark | Europe | Expansion interest |
| Zurich | Switzerland | Europe | Expansion interest |
| Geneva | Switzerland | Europe | Expansion interest |
| Dublin | Ireland | Europe | Expansion interest |
| Oslo | Norway | Europe | Expansion interest |
| Helsinki | Finland | Europe | Expansion interest |
| Brussels | Belgium | Europe | Expansion interest |
| Toronto | Canada | North America | Expansion interest |
| Vancouver | Canada | North America | Expansion interest |
| Montreal | Canada | North America | Expansion interest |
| San Francisco | United States | North America | Expansion interest |
| Boston | United States | North America | Expansion interest |
| Seattle | United States | North America | Expansion interest |
| Mexico City | Mexico | North America | Expansion interest |
| São Paulo | Brazil | South America | Expansion interest |
| Santiago | Chile | South America | Expansion interest |
| Lima | Peru | South America | Expansion interest |
| Bogotá | Colombia | South America | Expansion interest |
| Singapore | Singapore | Asia | Expansion interest |
| Seoul | South Korea | Asia | Expansion interest |
| Kuala Lumpur | Malaysia | Asia | Expansion interest |
| Jakarta | Indonesia | Asia | Expansion interest |
| Bangkok | Thailand | Asia | Expansion interest |
| Manila | Philippines | Asia | Expansion interest |
| Hong Kong | Hong Kong | Asia | Expansion interest |
| Taipei | Taiwan | Asia | Expansion interest |
| Dhaka | Bangladesh | Asia | Expansion interest |
| Lagos | Nigeria | Africa | Expansion interest |
| Accra | Ghana | Africa | Expansion interest |
| Cape Town | South Africa | Africa | Expansion interest |
| Johannesburg | South Africa | Africa | Expansion interest |
| Casablanca | Morocco | Africa | Expansion interest |
| Melbourne | Australia | Oceania | Expansion interest |
| Auckland | New Zealand | Oceania | Expansion interest |

## Validation

`src/test/chapter-event-catalog.test.tsx` covers all 79 IDs, deduplication, the six Italian cities, preservation of key legacy locations, valid coordinate bounds, status classification, country/status filtering and accent-insensitive lookup. Final integrated commands/results are recorded in `RELEASE_EVIDENCE.md`.
