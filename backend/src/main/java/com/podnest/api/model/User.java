package com.podnest.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column
    private String password;

    @Column
    private String fullName;

    @Column
    private String phoneNumber;

    @Column
    private String provider;

    @Column(nullable = false)
    private boolean notifyNewComments = true;

    @Column(nullable = false)
    private boolean notifyRecordingComplete = true;

    @Column(nullable = false)
    private boolean notifySpaceUsage = false;

    public User() {
    }

    public User(Long id, String email, String password, String fullName, String phoneNumber, String provider,
            boolean notifyNewComments, boolean notifyRecordingComplete, boolean notifySpaceUsage) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.provider = provider;
        this.notifyNewComments = notifyNewComments;
        this.notifyRecordingComplete = notifyRecordingComplete;
        this.notifySpaceUsage = notifySpaceUsage;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isNotifyNewComments() {
        return notifyNewComments;
    }

    public void setNotifyNewComments(boolean notifyNewComments) {
        this.notifyNewComments = notifyNewComments;
    }

    public boolean isNotifyRecordingComplete() {
        return notifyRecordingComplete;
    }

    public void setNotifyRecordingComplete(boolean notifyRecordingComplete) {
        this.notifyRecordingComplete = notifyRecordingComplete;
    }

    public boolean isNotifySpaceUsage() {
        return notifySpaceUsage;
    }

    public void setNotifySpaceUsage(boolean notifySpaceUsage) {
        this.notifySpaceUsage = notifySpaceUsage;
    }

    public static class UserBuilder {
        private Long builderId;
        private String builderEmail;
        private String builderPassword;
        private String builderFullName;
        private String builderPhoneNumber;
        private String builderProvider;
        private boolean builderNotifyNewComments = true;
        private boolean builderNotifyRecordingComplete = true;
        private boolean builderNotifySpaceUsage = false;

        public UserBuilder id(Long id) {
            this.builderId = id;
            return this;
        }

        public UserBuilder email(String email) {
            this.builderEmail = email;
            return this;
        }

        public UserBuilder password(String password) {
            this.builderPassword = password;
            return this;
        }

        public UserBuilder fullName(String fullName) {
            this.builderFullName = fullName;
            return this;
        }

        public UserBuilder phoneNumber(String phoneNumber) {
            this.builderPhoneNumber = phoneNumber;
            return this;
        }

        public UserBuilder provider(String provider) {
            this.builderProvider = provider;
            return this;
        }

        public UserBuilder notifyNewComments(boolean notifyNewComments) {
            this.builderNotifyNewComments = notifyNewComments;
            return this;
        }

        public UserBuilder notifyRecordingComplete(boolean notifyRecordingComplete) {
            this.builderNotifyRecordingComplete = notifyRecordingComplete;
            return this;
        }

        public UserBuilder notifySpaceUsage(boolean notifySpaceUsage) {
            this.builderNotifySpaceUsage = notifySpaceUsage;
            return this;
        }

        public User build() {
            return new User(this.builderId, this.builderEmail, this.builderPassword, this.builderFullName,
                    this.builderPhoneNumber, this.builderProvider,
                    this.builderNotifyNewComments, this.builderNotifyRecordingComplete, this.builderNotifySpaceUsage);
        }
    }
}
