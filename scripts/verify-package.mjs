import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Builds are explicit in CI; this inspection never publishes or executes pack hooks.
const scratch = mkdtempSync(join(tmpdir(), 'rnri-package-'));
const components = [
  'ExpandableTransactionCard',
  'CardStackSelector',
  'SwipeToPay',
  'AnimatedBalance',
  'HoldToConfirm',
  'InteractivePurchaseSheet',
  'PurchaseSheetHost',
];
try {
  const [result] = JSON.parse(
    execFileSync(
      'npm',
      ['pack', '--json', '--ignore-scripts', '--pack-destination', scratch],
      { encoding: 'utf8' }
    )
  );
  const archive = join(scratch, result.filename);
  const names = result.files.map((file) => file.path);
  for (const file of names) {
    assert(
      !file.startsWith('/') && !file.split('/').includes('..'),
      `Unsafe path ${file}`
    );
    assert(
      !/(^|\/)(node_modules|example|__tests__|evidence|\.git)(\/|$)/.test(file),
      `Development artifact ${file}`
    );
    assert(
      !/\.(apk|aab|ipa|p12|mobileprovision|key|keystore|tgz)$/.test(file),
      `Unexpected binary/credential ${file}`
    );
  }
  execFileSync('tar', ['-xzf', archive, '-C', scratch]);
  const root = join(scratch, 'package');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.version, '0.1.0-beta.1');
  assert.equal(pkg.name, '@manueldev25/react-native-reusable-interactions');
  assert.equal(pkg.publishConfig.tag, 'beta');
  assert.equal(pkg.publishConfig.access, 'public');
  assert.deepEqual(Object.keys(pkg.exports).sort(), ['.', './package.json']);
  assert(
    !pkg.dependencies,
    'UI peers must not be bundled as runtime dependencies'
  );
  for (const key of ['prepare', 'postpack', 'prepublishOnly'])
    assert(!pkg.scripts[key], `Unexpected lifecycle ${key}`);
  assert.equal(pkg.scripts.prepack, 'npm run build');
  for (const key of [pkg.main, pkg.types, pkg.exports['.']['react-native']])
    assert(statSync(resolve(root, key)).isFile(), `Missing entry ${key}`);
  const js = readFileSync(resolve(root, pkg.main), 'utf8');
  const types = readFileSync(resolve(root, pkg.types), 'utf8');
  for (const name of components) {
    assert(js.includes(`{ ${name} }`), `Missing runtime export ${name}`);
    assert(
      types.includes(name) && types.includes(`${name}Props`),
      `Missing public declaration ${name}`
    );
  }
  for (const type of [
    'SwipeToPayStatus',
    'HoldToConfirmStatus',
    'PurchaseSheetDismissReason',
    'ExpandableTransactionCardSpringConfig',
  ])
    assert(types.includes(type), `Missing ${type}`);
  function inspect(dir) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) inspect(path);
      else {
        const content = readFileSync(path, 'utf8');
        assert(
          !/\/Users\/[^\s"']+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|npm_[A-Za-z0-9]{30,}/.test(
            content
          ),
          `Local path or credential marker in ${path}`
        );
      }
    }
  }
  inspect(root);
  console.log(
    JSON.stringify(
      {
        name: pkg.name,
        version: pkg.version,
        integrity: result.integrity,
        files: names.length,
        bytes: result.size,
        publicComponents: components,
        contentsPassed: true,
      },
      null,
      2
    )
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
