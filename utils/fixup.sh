echo 'Running Fixup script...'
cat >dist/cjs/package.json <<!EOF
{
    "type": "commonjs",
    "types": "./index.d.ts"
}
!EOF
echo 'Created package.json for commonjs'

cat >dist/esm/package.json <<!EOF
{
    "type": "module",
    "types": "./index.d.ts"
}
!EOF

echo 'Created package.json for es module'

echo 'Finished Fixup script'