# TODO

## Current — New Playwright-native development

- [ ] Re-run full admission flows when the internal host is reachable and a valid, reset patient is available.
- [ ] Keep TypeScript, lint, focused unit tests, and relevant smoke/E2E checks current.
- [ ] Extend native coverage only for concrete business requirements.

## Next

- [ ] Resolve or replace blocked patient data before claiming live preadmit/inpatient verification.
- [ ] Review artifact/report retention and CI behavior using existing logger configuration.
- [ ] Add modal or spinner abstractions only when duplication is demonstrated.

## Future

- [ ] Consider additional page/action observability or external aggregation if explicitly requested.
- [ ] Expand API/DB validation coverage for new native flows.

## Technical debt / known limitations

- [ ] Address repository-wide formatting drift separately.
- [ ] Revisit mojibake Persian strings only with an encoding-safe plan.
- [ ] Remove or enable placeholder authentication coverage when requirements are defined.

## Completed historical migration work

- [x] Robot UI steps 01–20 transferred to Playwright + TypeScript.
- [x] Preadmit, inpatient, and emergency Playwright flows and supporting layers exist.
- [x] Robot-derived ng-select, cash, locator, fixture, and model structures exist.

No Robot migration item is pending.
