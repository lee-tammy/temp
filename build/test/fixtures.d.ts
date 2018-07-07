export interface Fixtures {
    [name: string]: string | Fixtures;
}
export declare function withFixtures(fixtures: Fixtures, fn: (fixturesDir: string) => Promise<{} | void>): Promise<void | {}>;
