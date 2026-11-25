import {getDirect} from './sdk';

test('only opted-in successful HTML can stand in for an absent legacy API', async () => {
  jest
    .spyOn(global, 'fetch')
    .mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => '<!doctype html><html></html>',
    });
  try {
    expect(
      await getDirect('official/head', {allowLegacyHtml: true})
    ).toMatchObject({legacyApiMissing: true});
    await expect(getDirect('private/latest')).rejects.toThrow();
    global.fetch.mockResolvedValue({
      status: 403,
      ok: false,
      text: async () => '<html>Forbidden</html>',
    });
    expect(await getDirect('official/head', {allowLegacyHtml: true})).toEqual({
      status: 403,
      ok: false,
      data: null,
    });
  } finally {
    global.fetch.mockRestore();
  }
});
