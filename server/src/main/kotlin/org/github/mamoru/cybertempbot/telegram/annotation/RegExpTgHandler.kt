package org.github.mamoru.cybertempbot.telegram.annotation

@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class RegExpTgHandler(val regExp: String)
