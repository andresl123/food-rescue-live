package com.foodrescue.auth.service;

import com.foodrescue.auth.entity.Student;
import com.foodrescue.auth.repository.StudentReactiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class StudentReactiveService {

    @Autowired
    private StudentReactiveRepository studentReactiveRepository;

    public Flux<Student> getAllStudents() {
        return studentReactiveRepository.findAll();
    }

    public Mono<Student> getStudentById(String id) {
        return studentReactiveRepository.findById(id);
    }

    public Mono<Student> saveStudent(Student student) {
        return studentReactiveRepository.save(student);
    }

    public Flux<Student> getStudentsByAge(int age) {
        return studentReactiveRepository.findByAge(age);
    }

    public Mono<Void> deleteStudent(String id) {
        return studentReactiveRepository.deleteById(id);
    }
}
