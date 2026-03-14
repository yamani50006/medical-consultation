export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(data, select, include) {
    return this.model.create({
      data,
      ...(select ? { select } : {}),
      ...(include ? { include } : {})
    });
  }

  findById(id, select, include) {
    return this.model.findUnique({
      where: { id },
      ...(select ? { select } : {}),
      ...(include ? { include } : {})
    });
  }

  findUnique(where, select, include) {
    return this.model.findUnique({
      where,
      ...(select ? { select } : {}),
      ...(include ? { include } : {})
    });
  }

  findOne(where, select, include) {
    return this.model.findFirst({
      where,
      ...(select ? { select } : {}),
      ...(include ? { include } : {})
    });
  }

  findMany(options = {}) {
    return this.model.findMany(options);
  }

  update(id, data, select, include) {
    return this.model.update({
      where: { id },
      data,
      ...(select ? { select } : {}),
      ...(include ? { include } : {})
    });
  }

  updateWhere(where, data, select, include) {
    return this.model.update({
      where,
      data,
      ...(select ? { select } : {}),
      ...(include ? { include } : {})
    });
  }

  delete(id) {
    return this.model.delete({
      where: { id }
    });
  }

  deleteWhere(where) {
    return this.model.delete({
      where
    });
  }

  count(where = {}) {
    return this.model.count({ where });
  }
}
