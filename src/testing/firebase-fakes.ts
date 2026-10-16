import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { of } from 'rxjs';
import { AuthService } from '../app/services/auth/auth.service';

// In-memory stand-ins for Firebase so unit tests run offline.
// Only the parts of the AngularFire compat API that the app uses are implemented.

type Data = Record<string, any>;

function snapshot(store: FakeFirestore, path: string) {
  const value = store.data.get(path);
  return {
    id: path.split('/').pop(),
    exists: value !== undefined,
    data: () => (value === undefined ? undefined : { ...value }),
  };
}

class FakeDoc {
  constructor(private store: FakeFirestore, private path: string) {}

  ref = {
    get: async () => snapshot(this.store, this.path),
  };

  get() {
    return of(snapshot(this.store, this.path));
  }

  valueChanges() {
    return of(this.store.data.get(this.path));
  }

  async set(value: Data, options?: { merge?: boolean }) {
    const current = options?.merge ? this.store.data.get(this.path) || {} : {};
    this.store.data.set(this.path, { ...current, ...value });
  }

  // Like Firestore, "a.b" keys update a nested field
  async update(value: Data) {
    if (!this.store.data.has(this.path)) throw new Error(`No document at ${this.path}`);
    const next = structuredClone(this.store.data.get(this.path));
    for (const [key, v] of Object.entries(value)) {
      const parts = key.split('.');
      let target = next;
      for (const part of parts.slice(0, -1)) target = target[part] ??= {};
      target[parts[parts.length - 1]] = v;
    }
    this.store.data.set(this.path, next);
  }

  async delete() {
    this.store.data.delete(this.path);
  }
}

class FakeQuery {
  constructor(
    private store: FakeFirestore,
    private path: string,
    private filters: ((d: Data) => boolean)[] = [],
    private sort?: { field: string; dir: 'asc' | 'desc' },
    private max?: number
  ) {}

  where(field: string, op: string, value: any) {
    const test = (d: Data) =>
      op === 'array-contains' ? (d[field] || []).includes(value) : d[field] === value;
    return new FakeQuery(this.store, this.path, [...this.filters, test], this.sort, this.max);
  }

  orderBy(field: string, dir: 'asc' | 'desc' = 'asc') {
    return new FakeQuery(this.store, this.path, this.filters, { field, dir }, this.max);
  }

  limit(n: number) {
    return new FakeQuery(this.store, this.path, this.filters, this.sort, n);
  }

  docs() {
    let docs = [...this.store.data.keys()]
      .filter((key) => key.startsWith(this.path + '/') && !key.slice(this.path.length + 1).includes('/'))
      .map((key) => snapshot(this.store, key))
      .filter((s) => this.filters.every((f) => f(s.data())));
    if (this.sort) {
      const { field, dir } = this.sort;
      docs.sort((a, b) => (a.data()[field] > b.data()[field] ? 1 : -1) * (dir === 'desc' ? -1 : 1));
    }
    if (this.max !== undefined) docs = docs.slice(0, this.max);
    return docs;
  }

  async get() {
    const docs = this.docs();
    return { empty: docs.length === 0, size: docs.length, docs };
  }
}

class FakeCollection {
  private query: FakeQuery;

  constructor(private store: FakeFirestore, private path: string, queryFn?: (ref: any) => any) {
    const base = new FakeQuery(store, path);
    this.query = queryFn ? queryFn(base) : base;
  }

  get ref() {
    return new FakeQuery(this.store, this.path);
  }

  doc(id: string) {
    return new FakeDoc(this.store, `${this.path}/${id}`);
  }

  async add(value: Data) {
    const id = `auto-${this.store.data.size + 1}`;
    this.store.data.set(`${this.path}/${id}`, { ...value });
    return { id };
  }

  get() {
    const docs = this.query.docs();
    return of({ empty: docs.length === 0, size: docs.length, docs });
  }

  valueChanges(options?: { idField?: string }) {
    return of(
      this.query.docs().map((s) =>
        options?.idField ? { ...s.data(), [options.idField]: s.id } : s.data()
      )
    );
  }
}

export class FakeFirestore {
  // full document path -> document data
  data = new Map<string, Data>();

  doc(path: string) {
    return new FakeDoc(this, path);
  }

  collection(path: string, queryFn?: (ref: any) => any) {
    return new FakeCollection(this, path, queryFn);
  }
}

export class FakeAuthService {
  constructor(
    public uid: string | null = 'test-user',
    private firestore?: FakeFirestore,
    public guest = false
  ) {}

  isGuest = () => this.guest;
  hasAccount = async () => !!this.uid && !this.guest;
  continueAsGuest = jasmine.createSpy('continueAsGuest').and.callFake(async () => {
    this.uid = 'guest-user';
    this.guest = true;
    return this.uid;
  });

  getProfile = async () => (this.uid && this.firestore?.data.get(`users/${this.uid}`)) || null;

  getCurrentUserId = async () => this.uid;
  getId = () => this.uid;
  login = jasmine.createSpy('login').and.resolveTo({ user: { uid: 'test-user' } });
  register = jasmine.createSpy('register').and.resolveTo({ user: { uid: 'test-user' } });
  logout = jasmine.createSpy('logout').and.resolveTo();
}

export const fakeAngularFireAuth = () => ({
  currentUser: Promise.resolve(null as any),
  signInAnonymously: jasmine
    .createSpy('signInAnonymously')
    .and.resolveTo({ user: { uid: 'guest-user', isAnonymous: true } }),
  signInWithEmailAndPassword: jasmine
    .createSpy('signInWithEmailAndPassword')
    .and.resolveTo({ user: { uid: 'test-user' } }),
  createUserWithEmailAndPassword: jasmine
    .createSpy('createUserWithEmailAndPassword')
    .and.resolveTo({ user: { uid: 'new-user' } }),
  signOut: jasmine.createSpy('signOut').and.resolveTo(),
});

// Replaces Firebase for a test; pass uid: null for no session, guest: true for a guest session.
// Call before TestBed.configureTestingModule. Set realAuthService to test AuthService itself.
export function firebaseFakes(
  options: { uid?: string | null; guest?: boolean; realAuthService?: boolean } = {}
) {
  const firestore = new FakeFirestore();
  const afAuth = fakeAngularFireAuth();
  const auth = new FakeAuthService(
    options.uid === undefined ? 'test-user' : options.uid,
    firestore,
    !!options.guest
  );
  const providers: Provider[] = [
    { provide: AngularFirestore, useValue: firestore },
    { provide: AngularFireAuth, useValue: afAuth },
  ];
  if (!options.realAuthService) providers.push({ provide: AuthService, useValue: auth });

  // AngularFire services are providedIn: 'any', so standalone pages would otherwise
  // create their own real instances; overrideProvider swaps them in every injector
  TestBed.overrideProvider(AngularFirestore, { useValue: firestore });
  TestBed.overrideProvider(AngularFireAuth, { useValue: afAuth });
  if (!options.realAuthService) TestBed.overrideProvider(AuthService, { useValue: auth });

  return { firestore, auth, afAuth, providers };
}
