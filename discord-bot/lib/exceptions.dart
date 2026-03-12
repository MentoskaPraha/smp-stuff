class NoDiscordTokenException implements Exception {
  String? details;

  NoDiscordTokenException([this.details]);

  @override
  String toString() {
    if (details == null) return "No Discord Token was provided.";
    return "No Discord Token was provided: $details";
  }
}

class NoDiscordAdminIdException implements Exception {
  String? details;

  NoDiscordAdminIdException([this.details]);

  @override
  String toString() {
    if (details == null) {
      return "No Discord User ID for the admin user was provided.";
    }
    return "No Discord User ID for the admin user was provided: $details";
  }
}

class NoDiscordGuildIdException implements Exception {
  String? details;

  NoDiscordGuildIdException([this.details]);

  @override
  String toString() {
    if (details == null) {
      return "No Discord Guild ID for the guild was provided.";
    }
    return "No Discord Guild ID for the guild was provided: $details";
  }
}
