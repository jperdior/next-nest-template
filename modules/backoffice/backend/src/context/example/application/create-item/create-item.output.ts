export class CreateItemOutput {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
