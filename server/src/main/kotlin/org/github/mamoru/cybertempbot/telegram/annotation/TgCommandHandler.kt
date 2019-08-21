package org.github.mamoru.cybertempbot.telegram.annotation

@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class TgCommandHandler(val command: String)
