# LA/GA quality assurance: execution plan
Status: DRAFT. Tests below are procedures, not claims of passing.

## Release gates
1. CI green: npm ci, npm test, npm run build; apply migrations in staging, then rerun.
2. Create dedicated test accounts: 12, exactly 13, 17, adult; test direct Auth API and alternate sign-in routes.
3. Use isolated disposable staging project; run concurrent signup simulation with 99, 100 and 101 accounts. Existing accounts count. Test unconfirmed/reused emails, abandoned accounts, deletion and waitlist.
4. With account A and B, verify RLS prevents accessing or altering one another's sessions, attempts, profile, settings, vocabulary, active sessions; verify question bank cannot be overwritten by normal user.
5. Complete 10-question practice, leave/return, resume cross-device, check answer persistence, failed review lifecycle, all vs targeted mock, 10-question default, math/visual rendering.
6. Validate calendar goal, streak, failed count and predicted score against fixed fixtures.
7. Test screen readers/keyboard, reduced motion, iPhone Safari, Android Chrome, iPad and desktop; no overflow/double scroll.
8. Exercise self-service deletion with a disposable account: confirm Auth user gone, no rows remain in all per-user tables, no residual files, and cannot restore session. Verify backup/log retention separately.
9. Test waitlist deduplication and status changes; load/rate tests must not use live student personal data.
10. Confirm privacy/terms approvals, independent trademark wording, content-license documentation, security-advisor issues resolved and monitoring/backup/recovery drill completed.

## Performance thresholds proposed (not verified)
- 0 critical auth, privacy, data loss or licensing defects.
- All tests/build/deployment successful, zero unresolved critical alerts.
- Enrollment never exceeds 100 accounts in concurrent staging tests.
- Critical pages and 10-question sessions function across supported breakpoints.
- Observe signup/first-session/four-practice-days/7-day-return funnel without unnecessary tracking.

## Actual test results
- Live Supabase project identified: gnhmfhvvirpgawijsrej; migrations from PR #57 not present at time inspected.
- Supabase security advisor: leaked-password protection disabled.
- Previous GitHub unit-test failure was assertion mismatch and was corrected; new complete CI result pending.
- Device tests, penetration tests, copyright authorization and deletion verification: NOT PERFORMED.
