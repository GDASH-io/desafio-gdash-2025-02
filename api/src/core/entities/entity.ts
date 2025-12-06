import { UniqueEntityID } from "./unique-entity-id";

export abstract class Entity<Props> {
  private _id: UniqueEntityID;
  protected props: Props;

  get id(): UniqueEntityID {
    return this._id;
  }

  protected constructor(props: Props, id?: UniqueEntityID) {
    this.props = props;
    this._id = id ?? new UniqueEntityID();
  }

  public equals(entity?: Entity<any>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id.equals(entity._id);
  }
}
