package server_test

import (
	"context"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	wego "github.com/weaveworks/weave-gitops/api/v1alpha"
	"github.com/weaveworks/weave-gitops/pkg/api/applications"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

var _ = Describe("ApplicationsServer", func() {
	It("AddApplication", func() {
		res, err := client.ListApplications(context.Background(), &applications.ListApplicationsRequest{})

		Expect(err).NotTo(HaveOccurred())

		Expect(len(res.Applications)).To(Equal(3))
	})
	It("GetApplication", func() {
		kubeClient.GetApplicationStub = func(name string) (*wego.Application, error) {
			return &wego.Application{
				ObjectMeta: v1.ObjectMeta{Name: "my-app"},
				Spec:       wego.ApplicationSpec{Path: "bar"},
			}, nil
		}

		res, err := client.GetApplication(context.Background(), &applications.GetApplicationRequest{ApplicationName: "my-app"})
		Expect(err).NotTo(HaveOccurred())

		Expect(res.Application.Name).To(Equal("my-app"))
	})
})