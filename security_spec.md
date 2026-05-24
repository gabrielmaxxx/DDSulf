# DDSulf Security Specification & TDD Test Harness

This specification details the Attribute-Based Access Control (ABAC) invariants and the strict testing strategy used to harden the DDSulf Firestore database.

---

## 1. Data & Operational Invariants

1. **Hierarchy Integrity**: No sub-collection resource or operational entry can be created without verifying that its parent entity exists and that the user is authorized.
2. **Identifier Poisoning Prevention**: All target document and path variables MUST be validated against character limits and regular expression constraints ($[A-Za-z0-9\_\-]+$) to avoid wallet drain and path hijacking.
3. **Temporal Sanity**: `createdAt` is immutable; both creation and update actions validate metadata variables (`createdAt`, `updatedAt`) against `request.time` server variables.
4. **State Transitions Rule**: Once an entity (such as Quotes or ServiceExecutions) reaches a terminal state (`Aprovado`, `Executado`, etc.), modifications to non-exempt fields are strictly denied unless done by an Admin.
5. **No Client Privilege Delegation**: Query reads are structured so that security checks are enforced on raw fields of `resource.data` to prevent wildcard dictionary querying.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads are designed to attack platform integrity. The system security rules must systematically reject all of them with a `PERMISSION_DENIED` exception.

### Attack Pillar 1: Identity Spoofing & Privilege Escalation
*   **Payload 1: Role Escalation via Signup**
    *   *Attack Vectors*: Create profile with a self-assigned `role: "admin"` to gain total permissions.
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 2: Fake Owner ID Spoofing**
    *   *Attack Vectors*: Create a quote representing a target client but with `createdBy: "different_malicious_user_id"`.
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 3: Read PII of Another User**
    *   *Attack Vectors*: Issue a wildcard read query to grab email/phone fields of user profiles without ownership credentials.
    *   *Expected Result*: `PERMISSION_DENIED`

### Attack Pillar 2: System Integrity & Value Poisoning
*   **Payload 4: Empty / Underflow Asset Price**
    *   *Attack Vectors*: Place empty string or negative number in `suggestedPrice` of commercial quote.
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 5: Over-sized Chemical Volume**
    *   *Attack Vectors*: Inject a massive payload into `recommendedProducts` inside a POP wiki page to cause a document space overload.
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 6: Unverified Email Write**
    *   *Attack Vectors*: Authenticate user with an unverified email (`email_verified == false`) and attempt to edit products catalog.
    *   *Expected Result*: `PERMISSION_DENIED`

### Attack Pillar 3: Orphaned Elements & Relational Holes
*   **Payload 7: Orphaned Quote Placement**
    *   *Attack Vectors*: Create a quote referencing a non-existent client ID (`clientId: "fake-id"`).
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 8: Subcollection Access Bypass**
    *   *Attack Vectors*: Directly read/write internal operational logs for an entity where parent ownership is missing.
    *   *Expected Result*: `PERMISSION_DENIED`

### Attack Pillar 4: Temporal Violations & State Short-cuts
*   **Payload 9: Forward-dated Creation Timestamp**
    *   *Attack Vectors*: Force `createdAt` or `updatedAt` to be future-dated values in a transactional expense payload.
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 10: Retroactive Modified Date Tampering**
    *   *Attack Vectors*: Update `updatedAt` field on a stock movement documentation with an arbitrary past date.
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 11: Modifying Terminal Approved Quote**
    *   *Attack Vectors*: Edit the cost structures, area sizes, or client specifications of a quote marked as `"Aprovado"`.
    *   *Expected Result*: `PERMISSION_DENIED`
*   **Payload 12: Bypassing Immutable Creation Date**
    *   *Attack Vectors*: Modify `createdAt` field on a previously saved client profile to overwrite data history.
    *   *Expected Result*: `PERMISSION_DENIED`

---

## 3. Test Runner Schema (TDD Reference)

The following TypeScript module represents a structured automated validation test runner utilizing standard Firestore testing SDK rules.

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

describe('DDSulf Firestore Rules Red-Team Attack Harness', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'esoteric-physics-88gvj',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('Attack 1: Prevent role self-escalation on registration', async () => {
    const maliciousContext = testEnv.authenticatedContext('hacker_uid', { email_verified: true });
    const userRef = doc(maliciousContext.firestore(), 'users/hacker_uid');
    
    await expect(setDoc(userRef, {
      uid: 'hacker_uid',
      email: 'hacker@ddsulf.com',
      name: 'Hacker',
      role: 'admin', // Self-assigned
      status: 'active'
    })).rejects.toThrow();
  });

  test('Attack 11: Prevent non-admin modification of terminal Approved Quote', async () => {
    const activeContext = testEnv.authenticatedContext('tech_uid', { email_verified: true });
    const quoteRef = doc(activeContext.firestore(), 'quotes/approved_quote_1');
    
    await expect(updateDoc(quoteRef, {
      areaSize: 999999
    })).rejects.toThrow();
  });
});
```
