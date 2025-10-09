package com.foodrescue.auth.controller;

import com.foodrescue.auth.entity.Student;
import com.foodrescue.auth.service.StudentReactiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/students/reactive")
public class StudentReactiveController {

    @Autowired
    private StudentReactiveService studentReactiveService;

    @GetMapping
    public Flux<Student> getAllStudents() {
        return studentReactiveService.getAllStudents();
    }

    @GetMapping("/{id}")
    public Mono<Student> getStudentById(@PathVariable String id) {
        return studentReactiveService.getStudentById(id);
    }

    @PostMapping
    public Mono<Student> saveStudent(@RequestBody Student student) {
        return studentReactiveService.saveStudent(student);
    }

    @GetMapping("/age/{age}")
    public Flux<Student> getStudentsByAge(@PathVariable int age) {
        return studentReactiveService.getStudentsByAge(age);
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteStudent(@PathVariable String id) {
        return studentReactiveService.deleteStudent(id);
    }
}
