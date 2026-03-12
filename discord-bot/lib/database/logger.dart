import "dart:async";
import "package:drift/drift.dart";
import "package:logging/logging.dart";

class LogInterceptor extends QueryInterceptor {
  final _logger = Logger("Database");

  Future<T> _log<T>(
    String description,
    FutureOr<T> Function() operation,
  ) async {
    _logger.finer("Running $description");

    try {
      final result = await operation();
      _logger.fine("Successfully ran $description");
      return result;
    } catch (e) {
      _logger.severe("Failed running $description", e);
      rethrow;
    }
  }

  @override
  Future<List<Map<String, Object?>>> runSelect(
    QueryExecutor executor,
    String statement,
    List<Object?> args,
  ) {
    return _log(
      "Select Statement: $statement with args: $args",
      () => executor.runSelect(statement, args),
    );
  }

  @override
  Future<int> runInsert(
    QueryExecutor executor,
    String statement,
    List<Object?> args,
  ) {
    return _log(
      "Insert Statement: $statement with args: $args",
      () => executor.runInsert(statement, args),
    );
  }

  @override
  Future<int> runUpdate(
    QueryExecutor executor,
    String statement,
    List<Object?> args,
  ) {
    return _log(
      "Update Statement: $statement with args: $args",
      () => executor.runUpdate(statement, args),
    );
  }

  @override
  Future<int> runDelete(
    QueryExecutor executor,
    String statement,
    List<Object?> args,
  ) {
    return _log(
      "Delete Statement: $statement with args: $args",
      () => executor.runDelete(statement, args),
    );
  }

  @override
  Future<void> commitTransaction(TransactionExecutor inner) {
    return _log("Commit of a Transaction", () => inner.send());
  }
}
